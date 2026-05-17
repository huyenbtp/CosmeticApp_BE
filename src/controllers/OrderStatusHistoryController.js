const OrderStatusHistoryService = require("../services/OrderStatusHistoryService");

const OrderStatusHistoryController = {
  async getAllByOrderId(req, res) {
    try {
      const orderStatusHistory = await OrderStatusHistoryService.getAllByOrderId(req.params.id);

      if (!orderStatusHistory) return res.status(404).json({ message: "Order status history not found" });

      res.json(orderStatusHistory);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async create(req, res) {
    try {
      const user_id = req.user.userId;
      const { order_id, status, notes } = req.body;

      const orderStatusHistory = await OrderStatusHistoryService.create(
        user_id,
        "staff",
        order_id,
        status,
        notes
      );

      res.status(201).json({ message: "Order status recorded" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async delete(req, res) {
    try {
      const deleted = await OrderStatusHistoryService.delete(req.params.id);

      if (!deleted) return res.status(404).json({ message: "Order status history not found" });

      res.json({ message: "Order status history deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = OrderStatusHistoryController;