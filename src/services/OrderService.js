const mongoose = require("mongoose");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Customer = require("../models/Customer");
const generateCode = require("../utils/codeGenerator");

const DiscountCodeService = require("./DiscountCodeService");
const ProductService = require("./ProductService");
const PointTransactionService = require("./PointTransactionService");
const DiscountCode = require("../models/DiscountCode");

const OrderService = {
  async createOrder(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        customer_id = null,
        discount_id = null,
        items,
        points_used = 0,
        notes = "",
      } = data;
      /**
         * items: [
         *   { product_id, unit_price, quantity }
         * ]
         */

      /* ---------- KIỂM TRA CUSTOMER ---------- */
      let customer = null;
      if (customer_id) {
        customer = await Customer.findById(customer_id).session(session);
        if (!customer) throw new Error("Customer not found");

        if (points_used > customer.points) {
          throw new Error("Not enough points");
        }
      } else if (points_used > 0) {
        throw new Error("Guest customer cannot use points");
      }

      /* ---------- TÍNH SUBTOTAL ---------- */
      let subtotal = 0;
      let totalItems = 0;

      for (const item of items) {
        subtotal += item.unit_price * item.quantity;
        totalItems += item.quantity;
      }

      /* ---------- VALIDATE DISCOUNT (CHƯA APPLY) ---------- */
      let discountCode = null;
      if (discount_id) {
        discountCode = await DiscountCodeService.validate(
          discount_id,
          subtotal,
          session
        );
      }

      /* ---------- TÍNH DISCOUNT (ƯỚC TÍNH) ---------- */
      let discountAmount = 0;
      if (discountCode) {
        discountAmount =
          discountCode.type === "percent"
            ? (subtotal * discountCode.value) / 100
            : discountCode.value;
      }

      /* ---------- TOTAL DỰ KIẾN ---------- */
      let estimatedTotal = subtotal - discountAmount - points_used;
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
            customer_id,
            discount_id,
            total_items: totalItems,
            subtotal: subtotal,
            discount_amount: discountAmount, //ước tính
            points_used,
            total_estimated: estimatedTotal,
            total_paid: 0,
            notes,
            payment_status: "unpaid",
          },
        ],
        { session }
      );

      /* ---------- TẠO ORDER DETAILS ---------- */
      const orderItems = items.map(item => ({
        order_id: order._id,
        product_id: item.product_id,
        unit_price: item.unit_price,
        quantity: item.quantity,
      }));

      await OrderItem.insertMany(orderItems, { session });

      /* ---------- TRỪ STOCK ---------- */
      await ProductService.validateAndDeduct(items, session);

      await session.commitTransaction();
      session.endSession();

      return order;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  async payOrder({ order_id, payment_method, }) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      /* ---------- GET ORDER ---------- */
      const order = await Order.findById(order_id).session(session);
      if (!order) throw new Error("Order not found");

      if (order.payment_status === "paid") {
        throw new Error("Order already paid");
      }

      /* ---------- KIỂM TRA CUSTOMER ---------- */
      let customer = null;
      if (order.customer_id) {
        customer = await Customer.findById(order.customer_id).session(session);
        if (!customer) throw new Error("Customer not found");
      }

      /* ---------- TRỪ & TÍCH ĐIỂM CHO KHÁCH ---------- */
      if (customer) {
        await PointTransactionService.applyOrderPoints({
          customer,
          orderId: order_id,
          totalAmount: order.total_estimated,
          pointsUsed: order.points_used,
          session,
        });
      }

      /* ---------- APPLY DISCOUNT ---------- */
      if (order.discount_id && order.discount_amount > 0) {
        const discountCode = await DiscountCode.findById(discount_id).session(session);
        if (!discountCode) throw new Error("Discount not found");

        discountCode.used_count += 1;
        await discountCode.save({ session });
      }

      /* ---------- UPDATE ORDER ---------- */
      order.total_paid = order.total_estimated;
      order.payment_method = payment_method;
      order.payment_status = "paid";

      await order.save({ session });

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
