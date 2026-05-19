const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Brand = require("../models/Brand");
const SkinType = require("../models/SkinType");
const ProductSkinType = require("../models/ProductSkinType");
const Tag = require("../models/Tag");
const ProductTag = require("../models/ProductTag");
const OrderItem = require("../models/OrderItem");
const ImportItem = require("../models/ImportItem");
const cloudinary = require("../config/cloudinary");
const getPublicIdFromUrl = require("../utils/getImagePublicId");
const CategoryService = require("../services/CategoryService");
const generateCode = require("../utils/codeGenerator");
const Counter = require("../models/Counter");

function normalizeCode(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
    .replace(/[^a-zA-Z]/g, "")      // bỏ ký tự đặc biệt
    .toUpperCase()
    .slice(0, 3);
}

const availableStockField = {
  available_stock: {
    $subtract: [
      "$total_stock",
      "$reserved_stock"
    ]
  }
};

const buildBaseProductPipeline = (product_id) => [
  {
    $match: {
      _id: new mongoose.Types.ObjectId(product_id),
    },
  },
  {
    $lookup: {
      from: "categories",
      localField: "category_id",
      foreignField: "_id",
      as: "category",
    },
  },
  { $unwind: "$category" },
  {
    $lookup: {
      from: "brands",
      localField: "brand_id",
      foreignField: "_id",
      as: "brand",
    },
  },
  { $unwind: "$brand" },
  {
    $lookup: {
      from: "productskintypes",
      localField: "_id",
      foreignField: "product_id",
      as: "pst",
    },
  },
  {
    $lookup: {
      from: "skintypes",
      localField: "pst.skin_type_id",
      foreignField: "_id",
      as: "skinTypes",
    },
  },
  {
    $lookup: {
      from: "producttags",
      localField: "_id",
      foreignField: "product_id",
      as: "pt",
    },
  },
  {
    $lookup: {
      from: "tags",
      localField: "pt.tag_id",
      foreignField: "_id",
      as: "tags",
    },
  },
  // 3 recent reviews
  {
    $lookup: {
      from: "productreviews",
      let: { product_id: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$product_id", "$$product_id"] },
          },
        },
        { $sort: { createdAt: -1 } }, // mới nhất trước
        { $limit: 3 },                // chỉ lấy 3 cái
      ],
      as: "reviews",
    },
  },

];

const ProductService = {
  async validateAndDeduct(items, session) {
    for (const item of items) {
      const product = await Product.findById(item.product_id).session(session);
      if (!product) {
        throw new Error("Product not found");
      }

      if (product.available_stock < item.quantity) {
        throw new Error(`Product ${product.name} is out of stock`);
      }

      product.reserved_stock += item.quantity;
      await product.save({ session });
    }
  },

  async getAllProducts() {
    return await Product.find();
  },

  async getProductStats() {
    const result = await Product.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: "$selling_price" },
          maxPrice: { $max: "$selling_price" },
          minStock: { $min: "$total_stock" },
          maxStock: { $max: "$total_stock" }
        }
      }
    ]);

    return {
      price: {
        min: result[0]?.minPrice ?? 0,
        max: result[0]?.maxPrice ?? 0
      },
      stock: {
        min: result[0]?.minStock ?? 0,
        max: result[0]?.maxStock ?? 0
      }
    };
  },

  async getProductsInfinite({
    q = "",
    page,
    limit,
  }) {
    const skip = (page - 1) * limit;

    /* ---------- BASE FILTER ---------- */
    const filter = {
      status: "published",
    };

    /* ---------- SEARCH ---------- */
    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [
        { name: regex },
        { sku: regex },
      ];
    }

    const pipeline = [
      { $match: filter },
      /* ---------- BRAND ---------- */
      {
        $lookup: {
          from: "brands",
          localField: "brand_id",
          foreignField: "_id",
          as: "brand",
        },
      },
      { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },

      /* ---------- SORT ---------- */
      { $sort: { updatedAt: -1 } },

      /* ---------- PAGINATION ---------- */
      { $skip: skip },
      { $limit: limit },

      /* ---------- RESPONSE SHAPE ---------- */
      {
        $project: {
          _id: 1,
          name: 1,
          selling_price: 1,
          image: 1,
          avg_rating: 1,
          brand: "$brand.name",
        },
      },
    ];

    const result = await Product.aggregate(pipeline);
    console.log(result)
    return result;
  },

  async getProductsPaginated({
    page,
    limit,
    q = "",
    category_slug,
    brand_id,
    minStock,
    maxStock,
    minPrice,
    maxPrice,
    status,
  }) {
    //console.log(page, limit, q, category_slug, brand_id, minPrice, maxPrice, minStock, maxStock, status)
    const skip = (page - 1) * limit;
    const filter = {};

    /* ---------- FILTER ---------- */
    if (category_slug) {
      const category = await Category.findOne({ slug: category_slug });

      if (!category) {
        return {
          data: [],
          pagination: { total: 0, page, limit },
        };
      }

      const categoryIds = await CategoryService.getAllChildCategoryIds(category._id);

      filter.category_id = {
        $in: categoryIds.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    if (brand_id) {
      filter.brand_id = new mongoose.Types.ObjectId(brand_id);
    }

    if (status) filter.status = status;

    if (minStock !== undefined || maxStock !== undefined) {
      filter.total_stock = {};
      if (minStock !== undefined) filter.total_stock.$gte = minStock;
      if (maxStock !== undefined) filter.total_stock.$lte = maxStock;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.selling_price = {};
      if (minPrice !== undefined) filter.selling_price.$gte = minPrice;
      if (maxPrice !== undefined) filter.selling_price.$lte = maxPrice;
    }

    /* ---------- SEARCH ---------- */
    const searchFilter = q
      ? {
        $or: [
          { name: { $regex: q, $options: "i" } },
          { sku: { $regex: q, $options: "i" } },
        ],
      }
      : {};

    /* ---------- AGGREGATE ---------- */
    const pipeline = [
      {
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "brands",
          localField: "brand_id",
          foreignField: "_id",
          as: "brand",
        },
      },
      { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
      { $match: { ...filter, ...searchFilter } },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                sku: 1,
                name: 1,
                category: {
                  _id: "$category._id",
                  name: "$category.name",
                },
                brand: {
                  _id: "$brand._id",
                  name: "$brand.name",
                },
                total_stock: 1,
                selling_price: 1,
                status: 1,
                image: 1,
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ];

    const result = await Product.aggregate(pipeline);

    return {
      data: result[0].data,
      pagination: {
        total: result[0].total[0]?.count || 0,
        page,
        limit,
      },
    };
  },

  async getProductByIdAdmin(product_id) {

    const pipeline = [
      ...buildBaseProductPipeline(product_id),
      {
        $addFields: availableStockField
      },
      {
        $lookup: {
          from: "orderitems",
          let: { product_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$product_id", "$$product_id"] },
              },
            },
            {
              $group: {
                _id: null,
                totalSold: { $sum: "$quantity" },
                totalRevenue: {
                  $sum: { $multiply: ["$quantity", "$unit_price"] },
                },
              },
            },
          ],
          as: "salesStats",
        },
      },
      {
        $lookup: {
          from: "importitems",
          let: { product_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$product_id", "$$product_id"] },
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            {
              $project: {
                createdAt: 1,
              },
            },
          ],
          as: "importStats",
        },
      },
      {
        $addFields: {
          totalSold: {
            $ifNull: [{ $arrayElemAt: ["$salesStats.totalSold", 0] }, 0],
          },
          totalRevenue: {
            $ifNull: [{ $arrayElemAt: ["$salesStats.totalRevenue", 0] }, 0],
          },
          lastImportDate: {
            $arrayElemAt: ["$importStats.createdAt", 0],
          },
        },
      },
      {
        $project: {
          _id: 1,
          sku: 1,
          name: 1,
          category: {
            _id: "$category._id",
            name: "$category.name",
          },
          brand: {
            _id: "$brand._id",
            name: "$brand.name",
          },
          skinTypes: 1,
          tags: 1,
          selling_price: 1,
          import_price: 1,
          description: 1,
          image: 1,
          total_stock: 1,
          reserved_stock: 1,
          available_stock: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          avg_rating: 1,
          review_count: 1,
          reviews: 1,
          totalSold: 1,
          totalRevenue: 1,
          lastImportDate: 1,
        },
      }
    ];

    const result = await Product.aggregate(pipeline);
    return result[0] || null;

  },

  async getProductByIdCustomer({ user_id, product_id }) {
    const pipeline = [
      ...buildBaseProductPipeline(product_id),
      {
        $addFields: availableStockField
      },
      {
        $lookup: {
          from: "orderitems",
          let: { product_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$product_id", "$$product_id"] },
              },
            },
            {
              $group: {
                _id: null,
                totalSold: { $sum: "$quantity" },
              },
            },
          ],
          as: "salesStats",
        },
      },
      {
        $addFields: {
          totalSold: {
            $ifNull: [{ $arrayElemAt: ["$salesStats.totalSold", 0] }, 0],
          },
        },
      },

      // on customer's wishlist ?
      {
        $lookup: {
          from: "wishlistitems",
          let: { product_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$product_id", "$$product_id"] },
                    {
                      $eq: [
                        "$user_id",
                        new mongoose.Types.ObjectId(user_id),
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: "wishlist",
        },
      },
      {
        $addFields: {
          isOnWishlist: { $gt: [{ $size: "$wishlist" }, 0] },
        },
      },

      {
        $project: {
          _id: 1,
          sku: 1,
          name: 1,
          category: {
            _id: "$category._id",
            name: "$category.name",
          },
          brand: {
            _id: "$brand._id",
            name: "$brand.name",
          },
          skinTypes: 1,
          tags: 1,
          selling_price: 1,
          description: 1,
          image: 1,
          available_stock: 1,
          totalSold: 1,
          status: 1,
          avg_rating: 1,
          review_count: 1,
          reviews: 1,
          isOnWishlist: 1,
        },
      }
    ];

    const result = await Product.aggregate(pipeline);
    return result[0] || null;
  },

  async getImportProductBySKU(sku) {
    return await Product.findOne({ sku });
  },

  async createProduct(data) {
    let { skinTypeIds, tagIds, ...productData } = data;
    let { sku, category_id, brand_id } = productData;

    const category = await Category.findById(category_id);
    if (!category) {
      throw new Error("Category not found");
    }

    const brand = await Brand.findById(brand_id);
    if (!brand) {
      throw new Error("Brand not found");
    }

    if (!Array.isArray(skinTypeIds)) {
      skinTypeIds = skinTypeIds ? [skinTypeIds] : [];
    }
    const skinTypes = await SkinType.find({
      _id: { $in: skinTypeIds }
    });
    if (skinTypes.length !== skinTypeIds.length) {
      throw new Error("Some skin types not found");
    }

    if (!Array.isArray(tagIds)) {
      tagIds = tagIds ? [tagIds] : [];
    }
    const tags = await Tag.find({
      _id: { $in: tagIds }
    });
    if (tags.length !== tagIds.length) {
      throw new Error("Some tags not found");
    }

    // ---------- SKU ----------
    if (sku) {
      const existedSku = await Product.findOne({ sku });
      if (existedSku) {
        throw new Error("SKU already exists");
      }
    } else {
      sku = await generateCode({
        entity: "product",
        pad: 6,
      });

      productData.sku = sku;
    }

    const product = await Product.create(productData);

    const productSkinTypes = skinTypeIds.map(id => ({
      skin_type_id: id,
      product_id: product._id,
    }));
    await ProductSkinType.insertMany(productSkinTypes);

    const productTags = tagIds.map(id => ({
      tag_id: id,
      product_id: product._id,
    }));
    await ProductTag.insertMany(productTags);

    return product;
  },

  async updateProduct(id, data) {
    const product = await Product.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    let { skinTypeIds, tagIds, ...productData } = data;
    let { sku, category_id, brand_id, image } = productData;

    // lấy category / brand hiện tại nếu FE không gửi mới
    const category =
      category_id && category_id !== String(product.category_id)
        ? await Category.findById(category_id)
        : await Category.findById(product.category_id);

    if (!category) {
      throw new Error("Category not found");
    }

    const brand =
      brand_id && brand_id !== String(product.brand_id)
        ? await Brand.findById(brand_id)
        : await Brand.findById(product.brand_id);

    if (!brand) {
      throw new Error("Brand not found");
    }

    //skin type
    if (!Array.isArray(skinTypeIds)) {
      skinTypeIds = skinTypeIds ? [skinTypeIds] : [];
    }
    const skinTypes = await SkinType.find({
      _id: { $in: skinTypeIds }
    });
    if (skinTypes.length !== skinTypeIds.length) {
      throw new Error("Some skin types not found");
    }

    //tag
    if (!Array.isArray(tagIds)) {
      tagIds = tagIds ? [tagIds] : [];
    }
    const tags = await Tag.find({
      _id: { $in: tagIds }
    });
    if (tags.length !== tagIds.length) {
      throw new Error("Some tags not found");
    }

    // SKU logic
    if ("sku" in data) {
      // FE gửi sku rỗng → generate mới
      if (sku === "") {
        sku = await generateCode({
          entity: "product",
          pad: 6,
        });

        product.sku = sku;
      }
      // FE gửi sku khác → check trùng
      else if (sku && sku !== product.sku) {
        const existedSku = await Product.findOne({ sku });
        if (existedSku) {
          throw new Error("SKU already exists");
        }
        product.sku = sku;
      }
    }

    // image logic
    if ("image" in data) {
      const oldImage = product.image;

      // XÓA ẢNH
      if (image === "null" && oldImage) {
        const publicId = getPublicIdFromUrl(oldImage);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
        product.image = "";
      }

      // CẬP NHẬT ẢNH MỚI
      else if (typeof image === "string" && image !== oldImage) {
        if (oldImage) {
          const publicId = getPublicIdFromUrl(oldImage);
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
          }
        }
        product.image = image;
      }
    }

    // ===== UPDATE SKIN TYPES =====
    // xóa relation cũ
    await ProductSkinType.deleteMany({
      product_id: id
    });
    // thêm relation mới
    if (skinTypeIds.length > 0) {
      const skinTypeDocs = skinTypeIds.map((skin_type_id) => ({
        product_id: id,
        skin_type_id
      }));
      await ProductSkinType.insertMany(skinTypeDocs);
    }

    // ===== UPDATE TAGS =====
    await ProductTag.deleteMany({
      product_id: id
    });
    if (tagIds.length > 0) {
      const tagDocs = tagIds.map((tag_id) => ({
        product_id: id,
        tag_id
      }));
      await ProductTag.insertMany(tagDocs);
    }

    // update other fields
    Object.keys(productData).forEach((key) => {
      if (key !== "image" && key !== "sku") {
        product[key] = data[key];
      }
    });

    await product.save();
    return product;
  },

  async updateProductStatus(id, status) {
    const product = await Product.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    product.status = status;
    await product.save();

    return product;
  },

  async deleteProduct(id) {
    const product = await Product.findById(id);
    if (!product) throw new Error("Product not found");

    if (product.image) {
      const publicId = getPublicIdFromUrl(product.image);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    await product.deleteOne();
    return true;
  },
}

module.exports = ProductService;
