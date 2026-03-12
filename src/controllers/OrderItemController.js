const OrderItemService = require("../services/OrderItemService");

class OrderItemController {
  async create(req, res) {
    try {
      const orderItem = await OrderItemService.createOrderItem(req.body);
      res.status(201).json(orderItem);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const orderItems = await OrderItemService.getAllOrderItems();
      res.json(orderItems);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const orderItem = await OrderItemService.getOrderItemById(req.params.id);

      if (!orderItem) return res.status(404).json({ message: "OrderItem not found" });

      res.json(orderItem);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await OrderItemService.updateOrderItem(req.params.id, req.body);

      if (!updated) return res.status(404).json({ message: "Order item not found" });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await OrderItemService.deleteOrderItem(req.params.id);

      if (!deleted) return res.status(404).json({ message: "Order item not found" });

      res.json({ message: "Order item deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new OrderItemController();
