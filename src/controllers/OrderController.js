const OrderService = require("../services/OrderService");
const Staff = require("../models/Staff");
const { validateCreateOrder } = require("../validators/order.validator");

const OrderController = {
  async create(req, res) {
    try {
      validateCreateOrder(req.body);

      const result = await OrderService.createOrder({
        ...req.body,
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async pay(req, res) {
    try {
      const { order_id, payment_method } = req.body;
      
      if (payment_method && !["cash", "bank_transfer"].includes(payment_method)) {
        throw new Error("Invalid payment_method");
      }

      const result = await OrderService.payOrder({
        order_id,
        payment_method,
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },


  async getAll(req, res) {
    try {
      const orders = await OrderService.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getById(req, res) {
    try {
      const order = await OrderService.getOrderById(req.params.id);

      if (!order) return res.status(404).json({ message: "Order not found" });

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async update(req, res) {
    try {
      const updated = await OrderService.updateOrder(req.params.id, req.body);

      if (!updated) return res.status(404).json({ message: "Order not found" });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async delete(req, res) {
    try {
      const deleted = await OrderService.deleteOrder(req.params.id);

      if (!deleted) return res.status(404).json({ message: "Order not found" });

      res.json({ message: "Order deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
}

module.exports = OrderController;
