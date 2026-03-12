const ImportItem = require("../models/ImportItem");
const Product = require("../models/Product");

class ImportItemService {
  async getImportItemByImportId(importId) {
    return await ImportItem.find({ import_id: importId })
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

      await ImportItem.create(
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

  async updateImportItem(id, updateData) {
    return await ImportItem.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  }

  async deleteImportItem(id) {
    return await ImportItem.findByIdAndDelete(id);
  }
}

module.exports = new ImportItemService();