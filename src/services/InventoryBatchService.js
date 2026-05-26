const mongoose = require("mongoose");
const ExportItem = require("../models/ExportItem");
const InventoryBatch = require("../models/InventoryBatch");
const ImportItem = require("../models/ImportItem");
const Product = require("../models/Product");
const ProductImport = require("../models/ProductImport");
const Staff = require("../models/Staff");
const generateCode = require("../utils/codeGenerator");

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
      const now = new Date();

      if (expiredStatus === "expired") {
        filter.exp_date = { $lte: now };

      } else if (expiredStatus === "less-than-1-month") {
        // Hết hạn trong vòng 1 tháng tới
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(now.getMonth() + 1);

        filter.exp_date = { $gte: now, $lte: oneMonthLater };

      } else if (expiredStatus === "1-3-months") {
        // Hết hạn trong khoảng từ 1 đến 3 tháng tới
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(now.getMonth() + 1);

        const threeMonthsLater = new Date();
        threeMonthsLater.setMonth(now.getMonth() + 3);

        filter.exp_date = { $gt: oneMonthLater, $lte: threeMonthsLater };

      } else if (expiredStatus === "3-6-months") {
        const threeMonthsLater = new Date();
        threeMonthsLater.setMonth(now.getMonth() + 3);

        const sixMonthsLater = new Date();
        sixMonthsLater.setMonth(now.getMonth() + 6);

        filter.exp_date = { $gt: threeMonthsLater, $lte: sixMonthsLater };

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
                batch_number: 1,
                product: {
                  _id: "$product._id",
                  sku: "$product.sku",
                  name: "$product.name",
                  image: "$product.image",
                },
                batch_code: 1,
                mfg_date: 1,
                exp_date: 1,
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
    const batch = await InventoryBatch.findById(id)
      .populate("product_id", "name sku image")
      .lean();

    return batch;
  },

  async getBatchByBatchNumber(number) {
    const batch = await InventoryBatch.findOne({ batch_number: number })
      .populate("product_id", "sku name image")
      .lean();

    return batch ? {
      ...batch,
      product_id: batch.product_id._id,
      product: batch.product_id,
    } : null
  },

  async registerNewBatch(data) {
    const { product_id, batch_code, mfg_date, exp_date } = data;

    const product = await Product.findById(product_id);
    if (!product) {
      throw new Error("Product not found");
    }

    const batchNumber = await generateCode({
      entity: "batch",
      withYearPrefix: true,
      pad: 6,
    })

    const newBatch = await InventoryBatch.create({
      batch_number: batchNumber,
      product_id,
      batch_code,
      mfg_date,
      exp_date,
      remaining_qty: 0,
    });

    return newBatch;
  },

  async update(id, updateData) {
    const batch = await InventoryBatch.findById(id);
    if (!batch) {
      throw new Error("Batch not found");
    }

    const hasImport = await ImportItem.exists({
      batch_id: id,
    });

    const hasExport = await ExportItem.exists({
      batch_id: id,
    });

    if (hasImport || hasExport) {
      throw new Error("Batch already used");
    }

    Object.assign(batch, updateData);
    await batch.save();
    return batch;
  },

  async delete(id) {
    const batch = await InventoryBatch.findById(id);
    if (!batch) {
      throw new Error("Batch not found");
    }

    const hasImport = await ImportItem.exists({
      batch_id: id,
    });

    const hasExport = await ExportItem.exists({
      batch_id: id,
    });

    if (hasImport || hasExport) {
      throw new Error("Batch already used");
    }

    return await batch.deleteOne();
  },
}

module.exports = InventoryBatchService;