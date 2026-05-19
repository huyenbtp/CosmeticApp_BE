const SkinType = require("../models/SkinType");
const ProductSkinType = require("../models/ProductSkinType");

const SkinTypeService = {
  async getAllSkinTypes() {
    /* ---------- AGGREGATE ---------- */
    const pipeline = [
      {
        $lookup: {
          from: "productskintypes",
          localField: "_id",
          foreignField: "skin_type_id",
          as: "productskintypes",
        },
      },
      {
        $addFields: {
          total_products: { $size: "$productskintypes" },
        },
      },
      { $sort: { name: 1 } },
      {
        $facet: {
          data: [
            {
              $project: {
                name: 1,
                description: 1,
                total_products: 1,
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ];

    const result = await SkinType.aggregate(pipeline);

    return result[0].data
  },

  async getSkinTypeById(id) {
    return await SkinType.findById(id);
  },

  async createSkinType(data) {
    return await SkinType.create(data);
  },

  async updateSkinType(id, updateData) {
    return await SkinType.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  },

  async deleteSkinType(id) {
    const skinType = await SkinType.findById(id);
    if (!skinType) {
      throw new Error("Skin type not found");
    }

    await ProductSkinType.deleteMany({ skin_type_id: id });

    await skinType.deleteOne();
    return true;
  },
}

module.exports = SkinTypeService;