const mongoose = require("mongoose");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const User = require("../models/User");
const generateCode = require("../utils/codeGenerator");

const ProductService = require("./ProductService");

const OrderService = {
  async createOrder(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        user_id,
        items,
        shipping_fee,
        payment_method,
        notes = "",
        receiver_name,
        phone,
        address_line = "",
        ward,
        district,
        city,
      } = data;
      /**
         * items: [
         *   { product_id, unit_price, quantity }
         * ]
         */

      /* ---------- KIỂM TRA USER ---------- */
      const user = await User.findById(user_id).session(session);
      if (!user) throw new Error("User not found");


      /* ---------- TÍNH SUBTOTAL ---------- */
      let subtotal = 0;
      let totalItems = 0;

      for (const item of items) {
        subtotal += item.unit_price * item.quantity;
        totalItems += item.quantity;
      }

      /* ---------- TOTAL DỰ KIẾN ---------- */
      let estimatedTotal = subtotal - shipping_fee;
      if (estimatedTotal < 0) estimatedTotal = 0;

      const orderCode = await generateCode({
        entity: "order",
        prefix: "ORD",
        pad: 6,
        session,
      });

      /* ---------- TẠO ORDER ---------- */
      const [order] = await Order.create(
        [
          {
            order_code: orderCode,
            user_id,
            total_items: totalItems,
            subtotal: subtotal,
            shipping_fee,
            total_estimated: estimatedTotal,
            total_paid: 0,
            payment_method,
            payment_status: "unpaid",
            notes,
            receiver_name,
            phone,
            address_line,
            ward,
            district,
            city,
          },
        ],
        { session }
      );

      /* ---------- TẠO ORDER ITEMS ---------- */
      const orderItems = items.map(item => ({
        order_id: order._id,
        product_id: item.product_id,
        unit_price: item.unit_price,
        quantity: item.quantity,
      }));

      await OrderItem.insertMany(orderItems, { session });

      /* ---------- TRỪ STOCK ---------- */
      //await ProductService.validateAndDeduct(items, session);

      await session.commitTransaction();
      session.endSession();

      return order;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  async getAllOrders() {
    return await Order.find();
  },

  async getOrderById(id) {
    return await Order.findById(id);
  },

  async updateOrderNotes(id, notes) {
    const order = await Order.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }

    order.notes = notes;
    await order.save();

    return order;
  },

  async updateOrderPaymentStatus(id, status) {
    const order = await Order.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }

    order.payment_status = status;
    await order.save();

    return order;
  },

  async deleteOrder(id) {
    return await Order.findByIdAndDelete(id);
  },
}

module.exports = OrderService;
