const OrderStatusHistoryService = require("../services/OrderStatusHistoryService");

class OrderStatusHistoryController {
  async create(req, res) {
    try {
      const orderStatusHistory = await OrderStatusHistoryService.createOrderStatusHistory(req.body);
      res.status(201).json(orderStatusHistory);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const orderStatusHistorys = await OrderStatusHistoryService.getAllOrderStatusHistorys();
      res.json(orderStatusHistorys);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const orderStatusHistory = await OrderStatusHistoryService.getOrderStatusHistoryById(req.params.id);

      if (!orderStatusHistory) return res.status(404).json({ message: "OrderStatusHistory not found" });

      res.json(orderStatusHistory);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await OrderStatusHistoryService.updateOrderStatusHistory(req.params.id, req.body);

      if (!updated) return res.status(404).json({ message: "OrderStatusHistory not found" });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await OrderStatusHistoryService.deleteOrderStatusHistory(req.params.id);

      if (!deleted) return res.status(404).json({ message: "OrderStatusHistory not found" });

      res.json({ message: "OrderStatusHistory deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new OrderStatusHistoryController();