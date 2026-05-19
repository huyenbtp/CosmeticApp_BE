const Tag = require("../models/Tag");
const ProductTag = require("../models/ProductTag");

const TagService = {
  async getAllTags(status = "") {
    if (status)
      return await Tag.find({ status });
    return await Tag.find();
  },

  async getTagsPaginated({
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
          from: "producttags",
          localField: "_id",
          foreignField: "tag_id",
          as: "producttags",
        },
      },
      {
        $addFields: {
          total_products: { $size: "$producttags" },
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
                status: 1,
                total_products: 1,
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ];

    const result = await Tag.aggregate(pipeline);

    return {
      data: result[0].data,
      pagination: {
        total: result[0].total[0]?.count || 0,
        page,
        limit,
      },
    };
  },

  async getTagById(id) {
    return await Tag.findById(id);
  },

  async createTag(data) {
    return await Tag.create(data);
  },

  async updateTag(id, updateData) {
    return await Tag.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  },

  async updateStatus(id, status) {
    const tag = await Tag.findById(id);
    if (!tag) {
      throw new Error("Tag not found");
    }

    tag.status = status;
    return await tag.save();
  },

  async deleteTag(id) {
    const tag = await Tag.findById(id);
    if (!tag) {
      throw new Error("Tag not found");
    }

    await ProductTag.deleteMany({ tag_id: id });

    await tag.deleteOne();
    return true;
  },
}

module.exports = TagService;