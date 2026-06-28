const Product = require("../models/Product");
const InventoryBatch = require("../models/InventoryBatch");

// Ngưỡng cảnh báo sắp hết hàng (có thể chỉnh)
const LOW_STOCK_THRESHOLD = 10;

// Lấy ngày nhập gần nhất của từng product (từ InventoryBatch)
async function getLastImportedMap(productIds) {
  const rows = await InventoryBatch.aggregate([
    { $match: { product_id: { $in: productIds } } },
    { $group: { _id: "$product_id", last: { $max: "$createdAt" } } },
  ]);
  const map = new Map();
  rows.forEach((r) => map.set(String(r._id), r.last));
  return map;
}

const StockReportService = {
  async getStockOverview() {
    // Lấy tất cả sản phẩm + tên brand
    const products = await Product.find()
      .populate("brand_id", "name")
      .lean();

    // ===== 1) Thống kê tổng quan =====
    let totalItems = 0;
    let totalValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const lowList = [];
    const outList = [];

    products.forEach((p) => {
      const stock = p.total_stock || 0;
      totalItems += stock;
      // Giá trị tồn = số lượng * giá nhập (vốn). Nếu chưa có import_price thì dùng selling_price
      const unitCost = p.import_price || p.selling_price || 0;
      totalValue += stock * unitCost;

      if (stock === 0) {
        outOfStockCount++;
        outList.push(p);
      } else if (stock <= LOW_STOCK_THRESHOLD) {
        lowStockCount++;
        lowList.push(p);
      }
    });

    // ===== 2) Lấy ngày nhập gần nhất cho các sp low + out =====
    const targetIds = [...lowList, ...outList].map((p) => p._id);
    const lastMap = await getLastImportedMap(targetIds);

    const mapItem = (p, withQty) => {
      const base = {
        _id: String(p._id),
        name: p.name,
        sku: p.sku,
        brand: p.brand_id?.name || "—",
        last_imported: lastMap.get(String(p._id)) || p.createdAt || null,
      };
      if (withQty) base.stock_quantity = p.total_stock || 0;
      return base;
    };

    // ===== 3) Trả về đúng cấu trúc frontend cần =====
    return {
      stats: {
        totalItems,
        totalValue,
        lowStockCount,
        outOfStockCount,
      },
      lowStockItems: lowList
        .sort((a, b) => (a.total_stock || 0) - (b.total_stock || 0))
        .map((p) => mapItem(p, true)),
      outOfStockItems: outList.map((p) => mapItem(p, false)),
    };
  },
};

module.exports = StockReportService;
