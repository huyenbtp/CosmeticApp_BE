const Brand = require("../models/Brand");

class BrandService {
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

    const { name, image } = updateData;

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
