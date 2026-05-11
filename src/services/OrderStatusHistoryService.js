const OrderStatusHistory = require("../models/OrderStatusHistory");
const Staff = require("../models/Staff");
const Order = require("../models/Order");

const statusType = ["pending", "confirmed", "shipping", "delivered", "cancelled", "returned"];

const OrderStatusHistoryService = {
  async getAllByOrderId(order_id) {
    const order = await Order.findById(order_id);
    if (!order) {
      throw new Error("Order not found");
    }

    const result = await OrderStatusHistory.find({ order_id })
      .sort({ updatedAt: -1 })
      .populate("updated_by", "full_name")
      .lean();

    return result.map(item => ({
      ...item,
      updated_by: item.updated_by.full_name
    }))
  },

  async create(user_id, order_id, status = "pending", notes = "") {
    const staff = await Staff.findOne({ user_id });
    if (!staff) {
      throw new Error("Staff not found");
    }

    const order = await Order.findById(order_id);
    if (!order) {
      throw new Error("Order not found");
    }

    if (!statusType.includes(status)) {
      throw new Error("Invalid status");
    }

    order.order_status = status;
    await order.save();

    return await OrderStatusHistory.create({ updated_by: staff._id, order_id, status, notes });
  },

  async delete(id) {
    return await OrderStatusHistory.findByIdAndDelete(id);
  }
}

module.exports = OrderStatusHistoryService;