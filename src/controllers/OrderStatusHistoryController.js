const OrderStatusHistoryService = require("../services/OrderStatusHistoryService");

class OrderStatusHistoryController {
  async create(req, res) {
    try {
      const orderStatusHistory = await OrderStatusHistoryService.create(req.body);
      res.status(201).json(orderStatusHistory);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const orderStatusHistorys = await OrderStatusHistoryService.getAll();
      res.json(orderStatusHistorys);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getByOrderId(req, res) {
    try {
      const orderStatusHistory = await OrderStatusHistoryService.getByOrderId(req.params.id);

      if (!orderStatusHistory) return res.status(404).json({ message: "OrderStatusHistory not found" });

      res.json(orderStatusHistory);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await OrderStatusHistoryService.delete(req.params.id);

      if (!deleted) return res.status(404).json({ message: "OrderStatusHistory not found" });

      res.json({ message: "OrderStatusHistory deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new OrderStatusHistoryController();