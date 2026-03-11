const Product = require("../models/Product");
const Category = require("../models/Category");
const Brand = require("../models/Brand");
const OrderDetail = require("../models/OrderDetail");
const ImportDetail = require("../models/ImportDetail");
const cloudinary = require("../config/cloudinary");
const getPublicIdFromUrl = require("../utils/getImagePublicId");
const mongoose = require("mongoose");
const CategoryService = require("../services/CategoryService");
const generateCode = require("../utils/codeGenerator");

function normalizeCode(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
    .replace(/[^a-zA-Z]/g, "")      // bỏ ký tự đặc biệt
    .toUpperCase()
    .slice(0, 3);
}

const ProductService = {
  async validateAndDeduct(items, session) {
    for (const item of items) {
      const product = await Product.findById(item.product_id).session(session);
      if (!product) {
        throw new Error("Product not found");
      }

      if (product.stock_quantity < item.quantity) {
        throw new Error(`Product ${product.name} is out of stock`);
      }

      product.stock_quantity -= item.quantity;
      await product.save({ session });
    }
  },

  async createProduct(data) {
    let { sku, category_id, brand_id } = data;

    const category = await Category.findById(category_id);
    if (!category) {
      throw new Error("Category not found");
    }

    const brand = await Brand.findById(brand_id);
    if (!brand) {
      throw new Error("Brand not found");
    }

    // ---------- SKU ----------
    if (sku) {
      const existedSku = await Product.findOne({ sku });
      if (existedSku) {
        throw new Error("SKU already exists");
      }
    } else {
      // format: SER-LOR-0001
      const categoryCode = normalizeCode(category.name);
      const brandCode = normalizeCode(brand.name);

      sku = await generateCode({
        entity: "product",
        prefix: `${categoryCode}-${brandCode}`
      });
      data.sku = sku;
    }

    return await Product.create(data);
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
          minStock: { $min: "$stock_quantity" },
          maxStock: { $max: "$stock_quantity" }
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
    q,
    page,
    limit,
  }) {
    const skip = (page - 1) * limit;

    /* ---------- BASE FILTER ---------- */
    const filter = {
      status: "published",
      stock_quantity: { $gt: 0 },
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

      /* ---------- CATEGORY ---------- */
      {
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

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
          sku: 1,
          name: 1,
          selling_price: 1,
          stock_quantity: 1,
          image: 1,

          category: "$category.name",
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
      filter.stock_quantity = {};
      if (minStock !== undefined) filter.stock_quantity.$gte = minStock;
      if (maxStock !== undefined) filter.stock_quantity.$lte = maxStock;
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
                stock_quantity: 1,
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

  async getProductById(id) {
    const product = await Product.findById(id)
      .populate("category_id", "name")
      .populate("brand_id", "name");

    if (!product) return null;

    /* ---------- TOTAL SOLD & REVENUE ---------- */
    const sales = await OrderDetail.aggregate([
      { $match: { product_id: product._id } },
      {
        $group: {
          _id: null,
          totalSold: { $sum: "$quantity" },
          totalRevenue: { $sum: { $multiply: ["$quantity", "$unit_price"] } },
        },
      },
    ]);

    /* ---------- LAST IMPORT DATE ---------- */
    const lastImport = await ImportDetail.findOne(
      { product_id: product._id },
      {},
      { sort: { createdAt: -1 } }
    );

    return {
      _id: product._id,
      sku: product.sku,
      name: product.name,
      category: product.category_id
        ? {
          _id: product.category_id._id,
          name: product.category_id.name,
        }
        : null,
      brand: product.brand_id
        ? {
          _id: product.brand_id._id,
          name: product.brand_id.name,
        }
        : null,
      selling_price: product.selling_price,
      import_price: product.import_price,
      description: product.description,
      image: product.image,
      stock_quantity: product.stock_quantity,
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      totalSold: sales[0]?.totalSold ?? 0,
      totalRevenue: sales[0]?.totalRevenue ?? 0,
      lastImportDate: lastImport?.createdAt ?? null,
    };
  },

  async getImportProductBySKU(sku) {
    return await Product.findOne({ sku });
  },

  async updateProduct(id, updateData) {
    const product = await Product.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    let { sku, category_id, brand_id, image } = updateData;

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

    // SKU logic
    if ("sku" in updateData) {
      // FE gửi sku rỗng → generate mới
      if (sku === "") {
        const categoryCode = normalizeCode(category.name);
        const brandCode = normalizeCode(brand.name);

        const now = new Date();
        const timeStr = now
          .toISOString()
          .replace(/[-:T.Z]/g, "")
          .slice(2, 14); // yyMMddHHmmss

        sku = `${categoryCode}-${brandCode}-${timeStr}`;
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
    if ("image" in updateData) {
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

    // update other fields
    Object.keys(updateData).forEach((key) => {
      if (key !== "image" && key !== "sku") {
        product[key] = updateData[key];
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
