const OrderDetailService = require("../services/OrderDetailService");

class OrderDetailController {
  async create(req, res) {
    try {
      const orderdetail = await OrderDetailService.createOrderDetail(req.body);
      res.status(201).json(orderdetail);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const orderdetails = await OrderDetailService.getAllOrderDetails();
      res.json(orderdetails);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const orderdetail = await OrderDetailService.getOrderDetailById(req.params.id);

      if (!orderdetail) return res.status(404).json({ message: "OrderDetail not found" });

      res.json(orderdetail);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await OrderDetailService.updateOrderDetail(req.params.id, req.body);

      if (!updated) return res.status(404).json({ message: "OrderDetail not found" });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await OrderDetailService.deleteOrderDetail(req.params.id);

      if (!deleted) return res.status(404).json({ message: "OrderDetail not found" });

      res.json({ message: "OrderDetail deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new OrderDetailController();
