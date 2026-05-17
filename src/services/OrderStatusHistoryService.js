const OrderStatusHistory = require("../models/OrderStatusHistory");
const User = require("../models/User");
const Customer = require("../models/Customer");
const Staff = require("../models/Staff");
const Order = require("../models/Order");

const statusType = ["pending", "confirmed", "packed", "shipping", "delivered", "cancelled", "returned"];

const OrderStatusHistoryService = {
  async getAllByOrderId(order_id) {
    const order = await Order.findById(order_id);
    if (!order) {
      throw new Error("Order not found");
    }

    const result = await OrderStatusHistory.find({ order_id })
      .sort({ updatedAt: -1 })
      .lean();

    return result;
  },

  async create(user_id, userRole = "staff", order_id, status = "pending", notes = "") {
    const user = await User.findById(user_id);
    if (!user) {
      throw new Error("User not found");
    }

    let profile;

    if (userRole !== "customer") {
      profile = await Staff.findOne({ user_id });
      if (!profile) {
        throw new Error("Staff not found");
      }
    } else {
      if (![pending, delivered, cancelled].includes(status)) {
        throw new Error ("Forbidden")
      }
      profile = await Customer.findOne({ user_id });
      if (!profile) {
        throw new Error("Customer not found");
      }
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

    return await OrderStatusHistory.create({
      order_id,
      status,
      notes,
      updated_by: user_id,
      updated_by_name: profile.full_name,
      updated_by_type: userRole,
    });
  },

  async delete(id) {
    return await OrderStatusHistory.findByIdAndDelete(id);
  }
}

module.exports = OrderStatusHistoryService;