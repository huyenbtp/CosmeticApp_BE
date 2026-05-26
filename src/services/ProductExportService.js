const mongoose = require("mongoose");
const ProductExport = require("../models/ProductExport");
const ExportItem = require("../models/ExportItem");
const Product = require("../models/Product");
const InventoryBatch = require("../models/InventoryBatch");
const OrderItem = require("../models/OrderItem");
const Staff = require("../models/Staff");
const generateCode = require("../utils/codeGenerator");

const ProductExportService = {
  async createNormalProductExport(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { user_id, notes = "", type = "adjust", items } = data;
      /**
         * items: [
         *   { batch_id, unit_price, quantity, notes }
         * ]
         */

      const staff = await Staff.findOne({ user_id });
      if (!staff) {
        throw new Error("Staff not found");
      }

      if (!items || items.length === 0) {
        throw new Error("Export items is required");
      }

      /* ---------- TÍNH TOÁN ---------- */
      let totalAmount = 0;
      let totalItems = 0;

      for (const item of items) {
        totalAmount += item.unit_price * item.quantity;
        totalItems += item.quantity;
      }

      const exportCode = await generateCode({
        entity: "productexport",
        withYearPrefix: true,
        pad: 6,
        session,
      });

      /* ---------- TẠO EXPORT ---------- */
      const productExport = await ProductExport.create([{
        export_code: exportCode,
        created_by: staff._id,
        total_amount: totalAmount,
        items_exported: totalItems,
        products_updated: items.length,
        notes,
        type,
      }], { session });

      const exportId = productExport[0]._id;

      /* ---------- TẠO EXPORT ITEMS ---------- */
      for (const item of items) {
        const batch = await InventoryBatch.findById(item.batch_id).session(session);
        if (!batch) {
          throw new Error("Batch not found");
        }
        if (batch.remaining_qty < item.quantity) {
          throw new Error(`Insufficient stock for batch ${batch.batch_code}`);
        }
        batch.remaining_qty -= item.quantity;
        await batch.save({ session });

        await Product.findByIdAndUpdate(
          batch.product_id,
          {
            $inc: {
              total_stock: -item.quantity,
            },
          },
          { session }
        );

        // create export item
        await ExportItem.create([{
          export_id: exportId,
          product_id: batch.product_id,
          batch_id: item.batch_id,
          unit_price: item.unit_price,
          quantity: item.quantity,
          notes: item.notes,
        }], { session });
      }

      await session.commitTransaction();

      return productExport[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  // FEFO export
  async createSalesProductExport({
    staff_id,
    notes = "",
    order_id,
    session,
  }) {
    const orderItems = await OrderItem.find({ order_id }).session(session);

    const exportCode = await generateCode({
      entity: "productexport",
      withYearPrefix: true,
      pad: 6,
      session,
    });

    let totalAmount = 0;
    let totalItems = 0;

    for (const item of orderItems) {
      totalAmount += item.unit_price * item.quantity;
      totalItems += item.quantity;
    }

    const exportDoc = await ProductExport.create(
      [{
        export_code: exportCode,
        created_by: staff_id,
        products_updated: orderItems.length,
        items_exported: totalItems,
        total_amount: totalAmount,
        order_id,
        type: "sales"
      }],
      { session }
    );

    const exportId = exportDoc[0]._id;

    for (const item of orderItems) {
      let remainingNeed = item.quantity;

      /**
       * FEFO:
       * 1. exp_date ASC
       * 2. remaining_qty ASC
       */
      const now = new Date();

      const batches = await InventoryBatch.find({
        product_id: item.product_id,
        exp_date: { $gt: now },
        remaining_qty: { $gt: 0 },
      })
        .sort({
          exp_date: 1,
          remaining_qty: 1,
        })
        .session(session);

      let totalAvailable = batches.reduce((sum, b) => sum + b.remaining_qty, 0);

      if (totalAvailable < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.product_id}`);
      }

      for (const batch of batches) {
        if (remainingNeed <= 0) { break; }

        const exportQty = Math.min(remainingNeed, batch.remaining_qty);

        batch.remaining_qty -= exportQty;

        await batch.save({ session });

        await ExportItem.create(
          [
            {
              export_id: exportId,
              product_id: item.product_id,
              batch_id: batch._id,
              unit_price: item.unit_price,
              quantity: exportQty,
            },
          ],
          { session }
        );

        remainingNeed -= exportQty;
      }

      await Product.findByIdAndUpdate(
        item.product_id,
        {
          $inc: {
            total_stock: -item.quantity,
            reserved_stock: -item.quantity,
          },
        },
        { session }
      );
    }
  },

  async deleteExport(id) {
    const productExport = await ProductExport.findById(id);
    if (!productExport) {
      throw new Error("Export not found");
    }

    await ExportItem.deleteMany({ export_id: id });

    await productExport.deleteOne();
    return true;
  },

  async getProductExports({
    page,
    limit,
    q = "",
    fromDate,
    toDate,
    type,
  }) {
    //console.log(page, limit, q, new Date(fromDate), new Date(toDate), type)
    const skip = (page - 1) * limit;
    const filter = {};

    /* ---------- FILTER ---------- */
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    if (type) filter.type = type;

    /* ---------- SEARCH ---------- */
    const searchFilter = q
      ? {
        $or: [
          { export_code: { $regex: q, $options: "i" } },
        ],
      }
      : {};

    /* ---------- AGGREGATE ---------- */
    const pipeline = [
      { $match: { ...filter, ...searchFilter } },
      {
        $lookup: {
          from: "staffs",
          localField: "created_by",
          foreignField: "_id",
          as: "staff",
        },
      },
      { $unwind: { path: "$staff", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },

      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                export_code: 1,
                staff: {
                  _id: "$staff._id",
                  staff_code: "$staff.staff_code",
                  full_name: "$staff.full_name",
                },
                total_amount: 1,
                items_exported: 1,
                type: 1,
                createdAt: 1,
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ];

    const result = await ProductExport.aggregate(pipeline);

    return {
      data: result[0].data,
      pagination: {
        total: result[0].total[0]?.count || 0,
        page,
        limit,
      },
    };
  },

  async getProductExportById(id) {
    const exportDoc = await ProductExport.findById(id)
      .populate("created_by", "staff_code full_name")
      .populate("order_id", "order_code")
      .lean();

    if (!exportDoc) {
      throw new Error("Export not found");
    }

    const items = await ExportItem.find({ export_id: id })
      .populate("product_id", "name sku image")
      .populate("batch_id", "batch_code")
      .lean();

    const { created_by, order_id, ...rest } = exportDoc;

    return {
      ...rest,
      createdStaff: created_by,
      order: order_id || null,
      items: items.map(({ product_id, batch_id, ...d }) => ({
        ...d,
        product: product_id,
        batch: batch_id,
      })),
    };
  },

  async updateProductExportNotes(id, notes) {
    const productExport = await ProductExport.findById(id);
    if (!productExport) {
      throw new Error("Product export not found");
    }

    productExport.notes = notes;
    await productExport.save();

    return productExport;
  },
}

module.exports = ProductExportService;