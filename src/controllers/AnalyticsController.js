const AnalyticsService = require("../services/AnalyticsService");

// Lấy filter từ query string
const getFilter = (req) => ({
  level: req.query.level || "month",
  day: req.query.day,
  month: Number(req.query.month) || new Date().getMonth() + 1,
  year: Number(req.query.year) || new Date().getFullYear(),
});

const handle = (fn) => async (req, res) => {
  try {
    const data = await fn(getFilter(req));
    res.json(data);
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: error.message });
  }
};

const AnalyticsController = {
  getKpis: handle((filter) => AnalyticsService.getKpis(filter)),
  getRevenueTrend: handle((filter) => AnalyticsService.getRevenueTrend(filter)),
  getCategoryShare: handle((filter) => AnalyticsService.getCategoryShare(filter)),
  getTopProducts: handle((filter) => AnalyticsService.getTopProducts(filter)),
};

module.exports = AnalyticsController;

