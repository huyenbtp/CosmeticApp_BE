const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Customer = require("../models/Customer");
const Product = require("../models/Product");

// Trạng thái đơn được tính doanh thu
const REVENUE_STATUSES = ["confirmed", "packed", "shipping", "delivered"];

// Tên 12 tháng (hiển thị nhãn biểu đồ)
const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DashboardService = {
  // 1) Tổng quan
  async getSummary() {
    const [revenueAgg, totalOrders, totalCustomers, totalProducts] =
      await Promise.all([
        Order.aggregate([
          { $match: { order_status: { $in: REVENUE_STATUSES } } },
          { $group: { _id: null, total: { $sum: "$total_estimated" } } },
        ]),
        Order.countDocuments(),
        Customer.countDocuments(),
        Product.countDocuments(),
      ]);

    return {
      totalRevenue: revenueAgg[0]?.total || 0,
      totalOrders,
      totalCustomers,
      totalProducts,
    };
  },

  // 2) Biểu đồ doanh thu (đổi theo daily / weekly / monthly)
  async getSalesOverview(range = "monthly") {
    const now = new Date();

    // ---- DAILY: 7 ngày gần nhất ----
    if (range === "daily") {
      const start = new Date();
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);

      const rows = await Order.aggregate([
        { $match: { order_status: { $in: REVENUE_STATUSES }, createdAt: { $gte: start } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$total_estimated" },
            orders: { $sum: 1 },
          },
        },
      ]);
      const map = new Map(rows.map((r) => [r._id, r]));

      const result = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        const item = map.get(key);
        result.push({
          label: `${d.getDate()}/${d.getMonth() + 1}`,
          revenue: item?.revenue || 0,
          orders: item?.orders || 0,
        });
      }
      return result;
    }

    // ---- WEEKLY: 8 tuần gần nhất ----
    if (range === "weekly") {
      const start = new Date();
      start.setDate(now.getDate() - 7 * 7); // lùi 7 tuần
      start.setHours(0, 0, 0, 0);

      const rows = await Order.aggregate([
        { $match: { order_status: { $in: REVENUE_STATUSES }, createdAt: { $gte: start } } },
        {
          $group: {
            _id: { year: { $isoWeekYear: "$createdAt" }, week: { $isoWeek: "$createdAt" } },
            revenue: { $sum: "$total_estimated" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.week": 1 } },
      ]);

      return rows.map((r) => ({
        label: `W${r._id.week}`,
        revenue: r.revenue,
        orders: r.orders,
      }));
    }

    // ---- MONTHLY (mặc định): 12 tháng của năm hiện tại ----
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const rows = await Order.aggregate([
      { $match: { order_status: { $in: REVENUE_STATUSES }, createdAt: { $gte: startOfYear } } },
      {
        $group: {
          _id: { $month: "$createdAt" }, // 1..12
          revenue: { $sum: "$total_estimated" },
          orders: { $sum: 1 },
        },
      },
    ]);
    const map = new Map(rows.map((r) => [r._id, r]));

    const result = [];
    for (let m = 1; m <= 12; m++) {
      const item = map.get(m);
      result.push({
        label: MONTH_LABELS[m - 1],
        revenue: item?.revenue || 0,
        orders: item?.orders || 0,
      });
    }
    return result;
  },

  // 3) Top danh mục (theo số sản phẩm)
  async getCategories() {
    const rows = await Product.aggregate([
      { $group: { _id: "$category_id", value: { $sum: 1 } } },
      { $sort: { value: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "cat",
        },
      },
      { $unwind: "$cat" },
      { $project: { _id: 0, name: "$cat.name", value: 1 } },
    ]);
    return rows;
  },

  // 4) Tăng trưởng khách hàng (12 tháng năm hiện tại, cộng dồn)
  async getCustomerGrowth() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Số khách đã có TRƯỚC đầu năm (làm điểm xuất phát cộng dồn)
    const before = await Customer.countDocuments({ createdAt: { $lt: startOfYear } });

    const rows = await Customer.aggregate([
      { $match: { createdAt: { $gte: startOfYear } } },
      { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
    ]);
    const map = new Map(rows.map((r) => [r._id, r.count]));

    let running = before;
    const result = [];
    for (let m = 1; m <= 12; m++) {
      running += map.get(m) || 0;
      result.push({ month: MONTH_LABELS[m - 1], customers: running });
    }
    return result;
  },

  // 5) Đơn theo trạng thái
  async getOrdersByStatus() {
    const rows = await Order.aggregate([
      { $group: { _id: "$order_status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    return rows.map((r) => ({ status: r._id, count: r.count }));
  },

  // 6) Top thương hiệu (theo số sản phẩm)
  async getBrands() {
    const rows = await Product.aggregate([
      { $group: { _id: "$brand_id", value: { $sum: 1 } } },
      { $sort: { value: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: "brands",
          localField: "_id",
          foreignField: "_id",
          as: "brand",
        },
      },
      { $unwind: "$brand" },
      { $project: { _id: 0, name: "$brand.name", logo: "$brand.logo", value: 1 } },
    ]);
    return rows;
  },

  // 7) Sản phẩm bán chạy
  async getTopProducts(limit = 7) {
    const rows = await OrderItem.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "order_id",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      { $match: { "order.order_status": { $in: REVENUE_STATUSES } } },
      { $group: { _id: "$product_id", sold: { $sum: "$quantity" } } },
      { $sort: { sold: -1 } },
      { $limit: Number(limit) || 7 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $project: { _id: 0, name: "$product.name", image: "$product.image", sold: 1 } },
    ]);
    return rows;
  },
};

module.exports = DashboardService;
