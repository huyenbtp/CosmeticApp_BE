const mongoose = require("mongoose");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const CartItem = require("../models/CartItem");
const OrderStatusHistory = require("../models/OrderStatusHistory");
const User = require("../models/User");
const Product = require("../models/Product");
const generateCode = require("../utils/codeGenerator");

const ProductService = require("./ProductService");

const OrderService = {
  async getAllOrders() {
    return await Order.find();
  },

  async getOrdersByUserId({
    user_id,
    page = 1,
    limit = 10,
    status,
  }) {
    const query = {
      user_id
    };

    // filter status
    if (status) {
      query.order_status = status;
    }

    // pagination
    const skip = (page - 1) * limit;

    // fetch data
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // check has more
    const total = await Order.countDocuments(query);

    return {
      orders,
      hasMore: skip + orders.length < total,
    };
  },

  async getOrderById(id) {
    const orderDoc = await Order.findById(id)
      .lean();

    if (!orderDoc) {
      throw new Error("Order not found");
    }

    const items = await OrderItem.find({ order_id: id })
      .populate("product_id", "name image")
      .lean();

    return {
      ...orderDoc,
      items: items.map(item => ({
        ...item,
        product_id: item.product_id._id,
        product: item.product_id,
      }))
    }
  },

  async createOrder(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        user_id,
        items,
        cartItemIds,
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

        /* ---------- TRỪ STOCK ---------- */
        const product = await Product.findById(item.product_id).session(session);
        if (!product) {
          throw new Error("Product not found");
        }

        if (product.available_stock < item.quantity) {
          throw new Error(`Some product is out of stock`);
        }

        product.reserved_stock += item.quantity;
        await product.save({ session });
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

      await OrderStatusHistory.create(
        [{
          order_id: order._id,
          status: "pending",
          updated_by: user_id,
          updated_by_name: "",
          updated_by_type: "customer",
        }],
        { session }
      );

      await CartItem.deleteMany({
        _id: { $in: cartItemIds }
      }).session(session);

      await session.commitTransaction();
      session.endSession();

      return order;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  async customerCancelOrder(user_id, order_id, data) {
    const order = await Order.findById(order_id);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.order_status === "confirmed") {
      throw new Error("Confirmed order cannot be canceled")
    }

    const { reason = "" } = data;

    await OrderStatusHistory.create({
      order_id: order_id,
      status: "cancelled",
      notes: reason,
      updated_by: user_id,
      updated_by_name: "",
      updated_by_type: "customer",
    });

    order.order_status = "cancelled";
    return await order.save();
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
