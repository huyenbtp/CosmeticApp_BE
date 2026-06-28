const DashboardService = require("../services/DashboardService");

// Hàm trợ giúp để bớt lặp code try/catch
const handle = (fn) => async (req, res) => {
  try {
    const data = await fn(req);
    res.json(data);
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: error.message });
  }
};

const DashboardController = {
  getSummary: handle(() => DashboardService.getSummary()),
  getSalesOverview: handle((req) => DashboardService.getSalesOverview(req.query.range)),
  getCategories: handle(() => DashboardService.getCategories()),
  getCustomerGrowth: handle(() => DashboardService.getCustomerGrowth()),
  getOrdersByStatus: handle(() => DashboardService.getOrdersByStatus()),
  getBrands: handle(() => DashboardService.getBrands()),
  getTopProducts: handle((req) => DashboardService.getTopProducts(Number(req.query.limit) || 7)),
};

module.exports = DashboardController;

