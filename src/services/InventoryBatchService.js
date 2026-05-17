const mongoose = require("mongoose");
const InventoryBatch = require("../models/InventoryBatch");
const ImportItem = require("../models/ImportItem");
const Product = require("../models/Product");
const ProductImport = require("../models/ProductImport");
const Staff = require("../models/Staff");

const InventoryBatchService = {
  async getInventoryBatches({
    page,
    limit,
    q = "",
    expiredStatus,
    stockStatus,
  }) {
    //console.log(page, limit, q, expiredStatus, stockStatus)
    const skip = (page - 1) * limit;
    const filter = {};

    /* ---------- FILTER ---------- */
    if (expiredStatus) {
      filter.exp_date = {};

      if (expiredStatus === "less-than-1-month") {

      } else if (expiredStatus === "1-3-months") {

      } else if (expiredStatus === "3-6-months") {

      }
    }

    if (stockStatus) {
      if (stockStatus === "low") {
        filter.remaining_qty = {};
        filter.remaining_qty.$lte = 20;
      }
      else if (stockStatus === "out") filter.remaining_qty = 0;
    }

    /* ---------- SEARCH ---------- */
    const searchFilter = q
      ? {
        $or: [
          { batch_code: { $regex: q, $options: "i" } },
        ],
      }
      : {};

    /* ---------- AGGREGATE ---------- */
    const pipeline = [
      { $match: { ...filter, ...searchFilter } },
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },

      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                import_item_id: 1,
                product: {
                  _id: "$product._id",
                  sku: "$product.sku",
                  name: "$product.name",
                  image: "$product.image",
                },
                batch_code: 1,
                mfg_date: 1,
                exp_date: 1,
                imported_qty: 1,
                remaining_qty: 1,
                createdAt: 1,
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ];

    const result = await InventoryBatch.aggregate(pipeline);

    return {
      data: result[0].data,
      pagination: {
        total: result[0].total[0]?.count || 0,
        page,
        limit,
      },
    };
  },

  async getInventoryBatchById(id) {
    const importDoc = await InventoryBatch.findById(id)
      .populate("created_by", "full_name staff_code")
      .populate("confirmed_by", "full_name staff_code")
      .lean();

    if (!importDoc) {
      throw new Error("Import not found");
    }

    const details = await ImportItem.find({ import_id: id })
      .populate("product_id", "name sku image")
      .lean();

    const { created_by, confirmed_by, ...rest } = importDoc;

    return {
      ...rest,
      createdStaff: created_by,
      confirmedStaff: confirmed_by || null,
      items: details.map(({ product_id, ...d }) => ({
        ...d,
        product: product_id,
      })),
    };
  },
}

module.exports = InventoryBatchService;