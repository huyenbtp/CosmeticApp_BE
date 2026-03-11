const ImportDetail = require("../models/ImportDetail");
const Product = require("../models/Product");

class ImportDetailService {
  async getImportDetailByImportId(importId) {
    return await ImportDetail.find({ import_id: importId })
      .populate("product_id", "sku name image")
      .sort({ createdAt: 1 });
  }

  async createMany(importId, items, session) {
    let totalAmount = 0;
    let totalItems = 0;
    const updatedProductIds = new Set();

    for (const item of items) {
      const { product_id, unit_price, quantity } = item;

      const product = await Product.findById(product_id).session(session);
      if (!product) {
        throw new Error("Product not found");
      }

      await ImportDetail.create(
        [
          {
            import_id: importId,
            product_id,
            unit_price,
            quantity,
          },
        ],
        { session }
      );

      // cập nhật tồn kho
      product.stock_quantity += quantity;
      await product.save({ session });

      totalAmount += unit_price * quantity;
      totalItems += quantity;
      updatedProductIds.add(String(product_id));
    }

    return {
      totalAmount,
      totalItems,
      productsUpdated: updatedProductIds.size,
    };
  }

  async updateImportDetail(id, updateData) {
    return await ImportDetail.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  }

  async deleteImportDetail(id) {
    return await ImportDetail.findByIdAndDelete(id);
  }
}

module.exports = new ImportDetailService();