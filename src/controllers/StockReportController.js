const StockReportService = require("../services/StockReportService");

const StockReportController = {
  async getOverview(req, res) {
    try {
      const data = await StockReportService.getStockOverview();
      res.json(data);
    } catch (error) {
      console.error("Stock report error:", error);
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = StockReportController;
