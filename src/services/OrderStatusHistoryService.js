const OrderStatusHistory = require("../models/OrderStatusHistory");

class OrderStatusHistoryService {

  async create(data) {
    return await OrderStatusHistory.create(data);
  }

  /**
   * Get all status history records for a specific order.
   * Sorted by creation time descending (using _id as proxy since timestamps are disabled).
   * @param {string} orderId - Order ID
   */
  async getByOrderId(orderId) {
    return await OrderStatusHistory.find({ order_id: orderId })
      .populate("updatedBy", "full_name staff_code")
      .sort({ _id: -1 });
  }


  async getAll() {
    return await OrderStatusHistory.find()
      .populate("updatedBy", "full_name staff_code")
      .sort({ _id: -1 });
  }


  async getById(id) {
    return await OrderStatusHistory.findById(id)
      .populate("updatedBy", "full_name staff_code");
  }


  async delete(id) {
    return await OrderStatusHistory.findByIdAndDelete(id);
  }
}

module.exports = new OrderStatusHistoryService();