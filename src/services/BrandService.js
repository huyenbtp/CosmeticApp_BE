const Brand = require("../models/Brand");
const cloudinary = require("../config/cloudinary");
const getPublicIdFromUrl = require("../utils/getImagePublicId");

class BrandService {
  async getBrandsPaginated({
    page,
    limit,
    q = "",
    status,
  }) {
    const skip = (page - 1) * limit;
    const filter = {};

    if (status) filter.status = status;

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
      { $match: { ...filter, ...searchFilter } },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "brand_id",
          as: "products",
        },
      },
      {
        $addFields: {
          total_products: { $size: "$products" },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                name: 1,
                logo: 1,
                status: 1,
                total_products: 1,
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ];

    const result = await Brand.aggregate(pipeline);

    return {
      data: result[0].data,
      pagination: {
        total: result[0].total[0]?.count || 0,
        page,
        limit,
      },
    };
  }

  async createBrand(data) {

    const existedBrandName = await Brand.findOne({ name: data.name });

    if (existedBrandName) {
      throw new Error("Brand name already exists");
    }

    return await Brand.create(data);
  }

  async getAllBrands() {
    return await Brand.find();
  }

  async getBrandById(id) {
    return await Brand.findById(id);
  }

  async updateBrand(id, updateData) {
    const brand = await Brand.findById(id);
    if (!brand) {
      throw new Error("Brand not found");
    }

    const { name, logo } = updateData;

    /* ---------- CHECK BRAND NAME UNIQUE ---------- */
    if (name && name !== brand.name) {
      const existedBrandName = await Brand.findOne({
        name,
        _id: { $ne: id },
      });

      if (existedBrandName) {
        throw new Error("Brand name already exists");
      }
    }

    // image logic
    if ("logo" in updateData) {
      const oldLogo = brand.logo;

      // XÓA ẢNH
      if (logo === "null" && oldLogo) {
        const publicId = getPublicIdFromUrl(oldLogo);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
        brand.logo = "";
      }

      // CẬP NHẬT ẢNH MỚI
      else if (typeof logo === "string" && logo !== oldLogo) {
        if (oldLogo) {
          const publicId = getPublicIdFromUrl(oldLogo);
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
          }
        }
        brand.logo = logo;
      }
    }

    /* ---------- UPDATE OTHER FIELDS ---------- */
    Object.keys(updateData).forEach((key) => {
      if (key !== "logo") {
        brand[key] = updateData[key];
      }
    });

    await brand.save();
    return brand;
  }

  async deleteBrand(id) {
    return await Brand.findByIdAndDelete(id);
  }
}

module.exports = new BrandService();
