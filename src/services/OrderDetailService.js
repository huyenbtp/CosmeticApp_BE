const OrderDetail = require("../models/OrderDetail");

class OrderDetailService {
  async createOrderDetail(data) {
    return await OrderDetail.create(data);
  }

  async getAllOrderDetails() {
    return await OrderDetail.find();
  }

  async getOrderDetailById(id) {
    return await OrderDetail.findById(id);
  }

  async updateOrderDetail(id, updateData) {
    return await OrderDetail.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  }

  async deleteOrderDetail(id) {
    return await OrderDetail.findByIdAndDelete(id);
  }
}

module.exports = new OrderDetailService();
