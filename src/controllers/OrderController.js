const OrderService = require("../services/OrderService");
const Staff = require("../models/Staff");
const { validateCreateOrder } = require("../validators/order.validator");

const OrderController = {
  async getAll(req, res) {
    try {
      const orders = await OrderService.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getOrders(req, res) {
    try {
      const {
        page,
        limit,
        q,
        fromDate,
        toDate,
        payment_method,
        order_status,
      } = req.query;

      /* ---------- VALIDATE DATE ---------- */
      if (fromDate && isNaN(Date.parse(fromDate))) {
        return res.status(400).json({ message: "Invalid fromDate" });
      }

      if (toDate && isNaN(Date.parse(toDate))) {
        return res.status(400).json({ message: "Invalid toDate" });
      }

      if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
        return res
          .status(400)
          .json({ message: "fromDate must be before toDate" });
      }

      const result = await OrderService.getOrders({
        page: Number(page) || 1,
        limit: Number(limit) || 7,
        q,
        fromDate,
        toDate,
        payment_method,
        order_status,
      });

      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getByUserId(req, res) {
    try {
      const user_id = req.user.userId;
      const { page, limit, status } = req.query;

      const result = await OrderService.getOrdersByUserId({
        user_id,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        status,
      });

      res.json(result);
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

  async create(req, res) {
    try {
      const user_id = req.user.userId;
      validateCreateOrder(req.body);

      const result = await OrderService.createOrder({
        user_id,
        ...req.body,
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async customerCancel(req, res) {
    try {
      const user_id = req.user.userId;

      const cancelled = await OrderService.customerCancelOrder(
        user_id,
        req.params.id,
        req.body
      );

      if (!cancelled) return res.status(404).json({ message: "Order not found" });

      res.json({ message: "Order cancelled" });
    } catch (error) {
      res.status(500).json({ message: error.message });
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
