const mongoose = require("mongoose");
const ProductImport = require("../models/ProductImport");
const ImportItem = require("../models/ImportItem");
const Product = require("../models/Product");
const InventoryBatch = require("../models/InventoryBatch");
const Staff = require("../models/Staff");
const generateCode = require("../utils/codeGenerator");

const ProductImportService = {
  async createProductImport(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { user_id, notes = "", status = "draft", type = "purchase", items } = data;
      /**
         * items: [
         *   { batch_id, unit_price, quantity }
         * ]
         */

      const staff = await Staff.findOne({ user_id });
      if (!staff) {
        throw new Error("Staff not found");
      }

      if (!items || items.length === 0) {
        throw new Error("Import items is required");
      }

      /* ---------- TÍNH TOÁN ---------- */
      let totalAmount = 0;
      let totalItems = 0;

      for (const item of items) {
        totalAmount += item.unit_price * item.quantity;
        totalItems += item.quantity;
      }

      const importCode = await generateCode({
        entity: "productimport",
        withYearPrefix: true,
        pad: 6,
        session,
      });

      /* ---------- TẠO IMPORT ---------- */
      const productImport = await ProductImport.create([{
        import_code: importCode,
        created_by: staff._id,
        total_amount: totalAmount,
        items_imported: totalItems,
        products_updated: items.length,
        notes,
        status,
        type,
      }], { session });

      const importId = productImport[0]._id;

      /* ---------- TẠO IMPORT ITEMS ---------- */
      for (const item of items) {
        const batch = await InventoryBatch.findById(item.batch_id).session(session);
        if (!batch) {
          throw new Error("Batch not found");
        }

        const product = await Product.findById(batch.product_id).session(session);
        if (!product) {
          throw new Error("Product not found");
        }

        // create import item
        await ImportItem.create([{
          import_id: importId,
          product_id: batch.product_id,
          batch_id: item.batch_id,
          unit_price: item.unit_price,
          quantity: item.quantity,
        }], { session });
      }

      await session.commitTransaction();
      session.endSession();

      return productImport[0];
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  async updateProductImport(id, data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const productImport = await ProductImport.findById(id).session(session);
      if (!productImport) {
        throw new Error("Import not found");
      }

      if (productImport.status !== "draft") {
        throw new Error("Only draft import is editable!");
      }

      await ImportItem.deleteMany({ import_id: id }).session(session);

      const { notes = "", type = "purchase", items } = data;
      /**
         * items: [
         *   { batch_id, unit_price, quantity }
         * ]
         */

      if (!items || items.length === 0) {
        throw new Error("Import items is required");
      }

      /* ---------- TÍNH TOÁN ---------- */
      let totalAmount = 0;
      let totalItems = 0;

      for (const item of items) {
        totalAmount += item.unit_price * item.quantity;
        totalItems += item.quantity;
      }

      /* ---------- UPDATE IMPORT ---------- */
      productImport.total_amount = totalAmount;
      productImport.items_imported = totalItems;
      productImport.products_updated = items.length;
      productImport.notes = notes;
      productImport.type = type;
      await productImport.save({ session });

      /* ---------- TẠO IMPORT ITEMS ---------- */
      for (const item of items) {
        const batch = await InventoryBatch.findById(item.batch_id).session(session);
        if (!batch) {
          throw new Error("Batch not found");
        }

        const product = await Product.findById(batch.product_id).session(session);
        if (!product) {
          throw new Error("Product not found");
        }

        // create import item
        await ImportItem.create([{
          import_id: id,
          product_id: batch.product_id,
          batch_id: item.batch_id,
          unit_price: item.unit_price,
          quantity: item.quantity,
        }], { session });
      }

      await session.commitTransaction();
      session.endSession();

      return productImport;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  async confirmImport(user_id, import_id) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const productImport = await ProductImport.findById(import_id).session(session);
      if (!productImport) {
        throw new Error("Import not found");
      }

      if (productImport.status !== "draft") {
        throw new Error("Can not confirm");
      }

      const staff = await Staff.findOne({ user_id });
      if (!staff) {
        throw new Error("Staff not found");
      }
      productImport.confirmed_by = staff._id;
      productImport.confirmedAt = new Date();
      productImport.status = "confirmed";
      await productImport.save({ session });

      const items = await ImportItem.find({ import_id: import_id })
        .lean()
        .session(session);

      for (const item of items) {
        const batch = await InventoryBatch.findById(item.batch_id).session(session);
        if (!batch) {
          throw new Error("Batch not found");
        }

        batch.remaining_qty += item.quantity;
        await batch.save({ session });

        const product = await Product.findById(item.product_id).session(session);
        if (!product) {
          throw new Error("Product not found");
        }

        // update stock
        product.total_stock += item.quantity;
        product.import_price = item.unit_price;
        await product.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      return productImport;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  async deleteImport(id) {
    const productImport = await ProductImport.findById(id);
    if (!productImport) {
      throw new Error("Import not found");
    }

    if (productImport.status !== "draft") {
      throw new Error("Only delete draft import!");
    }

    await ImportItem.deleteMany({ import_id: id });

    await productImport.deleteOne();
    return true;
  },

  async getProductImportStats() {
    const result = await ProductImport.aggregate([
      {
        $group: {
          _id: null,
          minTotal: { $min: "$total_amount" },
          maxTotal: { $max: "$total_amount" },
        }
      }
    ]);

    return {
      totalAmount: {
        min: result[0]?.minTotal ?? 0,
        max: result[0]?.maxTotal ?? 0
      },
    };
  },

  async getProductImports({
    page,
    limit,
    q = "",
    fromDate,
    toDate,
    minTotal,
    maxTotal,
    status,
    type,
  }) {
    //console.log(page, limit, q, new Date(fromDate), new Date(toDate), minTotal, maxTotal)
    const skip = (page - 1) * limit;
    const filter = {};

    /* ---------- FILTER ---------- */
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    if (minTotal !== undefined || maxTotal !== undefined) {
      filter.total_amount = {};
      if (minTotal !== undefined) filter.total_amount.$gte = minTotal;
      if (maxTotal !== undefined) filter.total_amount.$lte = maxTotal;
    }

    if (status) filter.status = status;
    if (type) filter.type = type;

    /* ---------- SEARCH ---------- */
    const searchFilter = q
      ? {
        $or: [
          { import_code: { $regex: q, $options: "i" } },
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
                import_code: 1,
                total_amount: 1,
                items_imported: 1,
                products_updated: 1,
                createdAt: 1,
                staff: {
                  _id: "$staff._id",
                  full_name: "$staff.full_name",
                  staff_code: "$staff.staff_code",
                },
                status: 1,
                type: 1,
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ];

    const result = await ProductImport.aggregate(pipeline);

    return {
      data: result[0].data,
      pagination: {
        total: result[0].total[0]?.count || 0,
        page,
        limit,
      },
    };
  },

  async getProductImportById(id) {
    const importDoc = await ProductImport.findById(id)
      .populate("created_by", "full_name staff_code")
      .populate("confirmed_by", "full_name staff_code")
      .lean();

    if (!importDoc) {
      throw new Error("Import not found");
    }

    const details = await ImportItem.find({ import_id: id })
      .populate("batch_id", "batch_number batch_code")
      .populate("product_id", "name sku image")
      .lean();

    const { created_by, confirmed_by, ...rest } = importDoc;

    return {
      ...rest,
      createdStaff: created_by,
      confirmedStaff: confirmed_by || null,
      items: details.map(({ batch_id, product_id, ...d }) => ({
        ...d,
        batch: batch_id,
        product: product_id,
      })),
    };
  },

  async updateProductImportNotes(id, notes) {
    const productImport = await ProductImport.findById(id);
    if (!productImport) {
      throw new Error("Product import not found");
    }

    productImport.notes = notes;
    await productImport.save();

    return productImport;
  },
}

module.exports = ProductImportService;