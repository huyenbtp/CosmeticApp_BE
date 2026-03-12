const OrderItem = require("../models/OrderItem");

class OrderItemService {
  async createOrderItem(data) {
    return await OrderItem.create(data);
  }

  async getAllOrderItems() {
    return await OrderItem.find();
  }

  async getOrderItemById(id) {
    return await OrderItem.findById(id);
  }

  async updateOrderItem(id, updateData) {
    return await OrderItem.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  }

  async deleteOrderItem(id) {
    return await OrderItem.findByIdAndDelete(id);
  }
}

module.exports = new OrderItemService();
