const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");
const Customer = require("../models/Customer");

const REVENUE_STATUSES = ["confirmed", "packed", "shipping", "delivered"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getRange(filter) {
  const { level, day, month, year } = filter;
  let start, end, prevStart, prevEnd;

  if (level === "day") {
    const d = new Date(day);
    start = new Date(d); start.setHours(0, 0, 0, 0);
    end = new Date(d); end.setHours(23, 59, 59, 999);
    prevStart = new Date(start); prevStart.setDate(prevStart.getDate() - 1);
    prevEnd = new Date(end); prevEnd.setDate(prevEnd.getDate() - 1);
  } else if (level === "year") {
    const y = Number(year);
    start = new Date(y, 0, 1, 0, 0, 0, 0);
    end = new Date(y, 11, 31, 23, 59, 59, 999);
    prevStart = new Date(y - 1, 0, 1, 0, 0, 0, 0);
    prevEnd = new Date(y - 1, 11, 31, 23, 59, 59, 999);
  } else {
    const y = Number(year);
    const m = Number(month) - 1;
    start = new Date(y, m, 1, 0, 0, 0, 0);
    end = new Date(y, m + 1, 0, 23, 59, 59, 999);
    prevStart = new Date(y, m - 1, 1, 0, 0, 0, 0);
    prevEnd = new Date(y, m, 0, 23, 59, 59, 999);
  }

  return { start, end, prevStart, prevEnd };
}

async function getMetrics(start, end) {
  const [orderAgg, newCustomers] = await Promise.all([
    Order.aggregate([
      { $match: { order_status: { $in: REVENUE_STATUSES }, createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, revenue: { $sum: "$total_estimated" }, orders: { $sum: 1 } } },
    ]),
    Customer.countDocuments({ createdAt: { $gte: start, $lte: end } }),
  ]);

  const revenue = orderAgg[0]?.revenue || 0;
  const orders = orderAgg[0]?.orders || 0;
  const avgOrderValue = orders ? Math.round(revenue / orders) : 0;

  return { revenue, orders, newCustomers, avgOrderValue };
}

const AnalyticsService = {
  async getKpis(filter) {
    const { start, end, prevStart, prevEnd } = getRange(filter);
    const [cur, prev] = await Promise.all([
      getMetrics(start, end),
      getMetrics(prevStart, prevEnd),
    ]);

    return [
      { label: "Revenue", value: cur.revenue, prevValue: prev.revenue, format: "currency" },
      { label: "Orders", value: cur.orders, prevValue: prev.orders, format: "number" },
      { label: "New Customers", value: cur.newCustomers, prevValue: prev.newCustomers, format: "number" },
      { label: "Avg Order Value", value: cur.avgOrderValue, prevValue: prev.avgOrderValue, format: "currency" },
    ];
  },

  async getRevenueTrend(filter) {
    const { level } = filter;
    const { start, end } = getRange(filter);

    if (level === "day") {
      const rows = await Order.aggregate([
        { $match: { order_status: { $in: REVENUE_STATUSES }, createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: { $hour: "$createdAt" }, revenue: { $sum: "$total_estimated" }, orders: { $sum: 1 } } },
      ]);
      const map = new Map(rows.map((r) => [r._id, r]));
      const result = [];
      for (let h = 0; h < 24; h++) {
        const item = map.get(h);
        result.push({ label: `${h}h`, revenue: item?.revenue || 0, orders: item?.orders || 0 });
      }
      return result;
    }

    if (level === "year") {
      const rows = await Order.aggregate([
        { $match: { order_status: { $in: REVENUE_STATUSES }, createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: { $month: "$createdAt" }, revenue: { $sum: "$total_estimated" }, orders: { $sum: 1 } } },
      ]);
      const map = new Map(rows.map((r) => [r._id, r]));
      const result = [];
      for (let m = 1; m <= 12; m++) {
        const item = map.get(m);
        result.push({ label: MONTH_LABELS[m - 1], revenue: item?.revenue || 0, orders: item?.orders || 0 });
      }
      return result;
    }

    const rows = await Order.aggregate([
      { $match: { order_status: { $in: REVENUE_STATUSES }, createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: { $dayOfMonth: "$createdAt" }, revenue: { $sum: "$total_estimated" }, orders: { $sum: 1 } } },
    ]);
    const map = new Map(rows.map((r) => [r._id, r]));
    const daysInMonth = end.getDate();
    const result = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const item = map.get(d);
      result.push({ label: `${d}`, revenue: item?.revenue || 0, orders: item?.orders || 0 });
    }
    return result;
  },

  async getCategoryShare(filter) {
    const { start, end } = getRange(filter);

    const rows = await OrderItem.aggregate([
      { $lookup: { from: "orders", localField: "order_id", foreignField: "_id", as: "order" } },
      { $unwind: "$order" },
      { $match: { "order.order_status": { $in: REVENUE_STATUSES }, "order.createdAt": { $gte: start, $lte: end } } },
      { $lookup: { from: "products", localField: "product_id", foreignField: "_id", as: "product" } },
      { $unwind: "$product" },
      // SỬA: tính doanh thu = quantity * unit_price
      { $group: { _id: "$product.category_id", value: { $sum: { $multiply: ["$quantity", "$unit_price"] } } } },
      { $sort: { value: -1 } },
      { $limit: 6 },
      { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "cat" } },
      { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, name: { $ifNull: ["$cat.name", "Khác"] }, value: 1 } },
    ]);
    return rows;
  },

  async getTopProducts(filter) {
    const { start, end } = getRange(filter);

    const rows = await OrderItem.aggregate([
      { $lookup: { from: "orders", localField: "order_id", foreignField: "_id", as: "order" } },
      { $unwind: "$order" },
      { $match: { "order.order_status": { $in: REVENUE_STATUSES }, "order.createdAt": { $gte: start, $lte: end } } },
      // SỬA: revenue = quantity * unit_price
      {
        $group: {
          _id: "$product_id",
          sold: { $sum: "$quantity" },
          revenue: { $sum: { $multiply: ["$quantity", "$unit_price"] } },
        }
      },
      { $sort: { sold: -1 } },
      { $limit: 10 },
      { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
      { $unwind: "$product" },
      { $lookup: { from: "categories", localField: "product.category_id", foreignField: "_id", as: "cat" } },
      { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          name: "$product.name",
          image: "$product.image",
          category: { $ifNull: ["$cat.name", "Khác"] },
          sold: 1,
          revenue: 1,
        },
      },
    ]);
    return rows;
  },
};

module.exports = AnalyticsService;
