const mongoose = require("mongoose");
const ProductImport = require("../models/ProductImport");
const ImportDetail = require("../models/ImportDetail");
const Product = require("../models/Product");
const generateCode = require("../utils/codeGenerator");

const ProductImportService = {
  async createProductImport(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { staff_id, note = "", items } = data;
      /**
         * items: [
         *   { product_id, unit_price, quantity }
         * ]
         */

      if (!items || items.length === 0) {
        throw new Error("Import items is required");
      }

      /* ---------- TÍNH TOÁN ---------- */
      let totalAmount = 0;
      let totalItems = 0;
      let productsUpdated = 0;

      for (const item of items) {
        totalAmount += item.unit_price * item.quantity;
        totalItems += item.quantity;
      }

      const importCode = await generateCode({
        entity: "productimport",
        prefix: "IMP",
        session,
      });

      /* ---------- TẠO IMPORT ---------- */
      const productImport = await ProductImport.create([{
        import_code: importCode,
        staff_id,
        total_amount: totalAmount,
        items_imported: totalItems,
        products_updated: items.length,
        note,
      }], { session });

      const importId = productImport[0]._id;

      /* ---------- TẠO IMPORT DETAILS + UPDATE STOCK ---------- */
      for (const item of items) {
        const product = await Product.findById(item.product_id).session(session);
        if (!product) {
          throw new Error("Product not found");
        }

        // create import detail
        await ImportDetail.create([{
          import_id: importId,
          product_id: item.product_id,
          unit_price: item.unit_price,
          quantity: item.quantity,
        }], { session });

        // update stock
        product.stock_quantity += item.quantity;
        product.import_price = item.unit_price;
        await product.save({ session });

        productsUpdated++;
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
    by = "import_code",
    fromDate,
    toDate,
    minTotal,
    maxTotal,
  }) {
    //console.log(page, limit, q, by, new Date(fromDate), new Date(toDate), minTotal, maxTotal)
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

    /* ---------- SEARCH ---------- */
    const searchRegex = q ? new RegExp(q, "i") : null;

    const searchFilter = q
      ? (() => {
        switch (by) {
          case "import_code":
            return { import_code: searchRegex };
          case "staff_name":
            return { "staff.full_name": searchRegex };
          case "staff_code":
            return { "staff.staff_code": searchRegex };
          default:
            return {};
        }
      })()
      : {};

    /* ---------- AGGREGATE ---------- */
    const pipeline = [
      {
        $lookup: {
          from: "staffs",
          localField: "staff_id",
          foreignField: "_id",
          as: "staff",
        },
      },
      { $unwind: { path: "$staff", preserveNullAndEmptyArrays: true } },
      { $match: { ...filter, ...searchFilter } },
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
      .populate("staff_id", "full_name staff_code")
      .lean();

    if (!importDoc) {
      throw new Error("Import not found");
    }

    const details = await ImportDetail.find({ import_id: id })
      .populate("product_id", "name sku image")
      .lean();

    const { staff_id, ...rest } = importDoc;

    return {
      ...rest,
      staff: staff_id,
      items: details.map(({ product_id, ...d }) => ({
        ...d,
        product: product_id,
      })),
    };
  },

  async updateProductImportNote(id, note) {
    const productImport = await ProductImport.findById(id);
    if (!productImport) {
      throw new Error("Product import not found");
    }

    productImport.note = note;
    await productImport.save();

    return productImport;
  },
}

module.exports = ProductImportService;