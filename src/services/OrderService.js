const mongoose = require("mongoose");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const CartItem = require("../models/CartItem");
const OrderStatusHistory = require("../models/OrderStatusHistory");
const User = require("../models/User");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const generateCode = require("../utils/codeGenerator");

const ProductService = require("./ProductService");

const OrderService = {
  async getAllOrders() {
    return await Order.find();
  },

  async getOrders({
    page,
    limit,
    q = "",
    fromDate,
    toDate,
    payment_method,
    order_status,
  }) {
    //console.log(page, limit, q)
    const skip = (page - 1) * limit;
    const filter = {};

    /* ---------- FILTER ---------- */
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    if (payment_method) filter.payment_method = payment_method;
    if (order_status) filter.order_status = order_status;

    /* ---------- SEARCH ---------- */
    const searchFilter = q
      ? {
        $or: [
          { order_code: { $regex: q, $options: "i" } },
        ],
      }
      : {};

    /* ---------- AGGREGATE ---------- */
    const pipeline = [
      { $match: { ...filter, ...searchFilter } },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "customers",
          localField: "user_id",
          foreignField: "user_id",
          as: "customer",
        },
      },
      { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },

      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                order_code: 1,
                user_id: 1,
                customer: {
                  _id: "$customer._id",
                  full_name: "$customer.full_name",
                  phone: "$customer.phone",
                  email: "$user.email",
                },
                total_items: 1,
                total_estimated: 1,
                payment_method: 1,
                order_status: 1,
                createdAt: 1,
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ];

    const result = await Order.aggregate(pipeline);

    return {
      data: result[0].data,
      pagination: {
        total: result[0].total[0]?.count || 0,
        page,
        limit,
      },
    };
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
      .populate("user_id", "email")
      .lean();

    if (!orderDoc) {
      throw new Error("Order not found");
    }

    const customer = await Customer.findOne({ user_id: orderDoc.user_id._id })

    if (!customer) {
      throw new Error("Customer not found");
    }

    const items = await OrderItem.find({ order_id: id })
      .populate("product_id", "name sku image")
      .lean();

    return {
      ...orderDoc,
      user_id: orderDoc.user_id._id,
      customer: {
        _id: customer._id,
        full_name: customer.full_name,
        phone: customer.phone,
        email: orderDoc.user_id.email,
      },
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

        /* ---------- RESERVE STOCK ---------- */
        const product = await Product.findById(item.product_id).session(session);
        if (!product) {
          throw new Error("Product not found");
        }

        const available_stock = product.total_stock - product.reserved_stock;

        if (available_stock < item.quantity) {
          throw new Error(`Some product is out of stock`);
        }

        product.reserved_stock += item.quantity;
        await product.save({ session });
      }

      /* ---------- TOTAL DỰ KIẾN ---------- */
      let estimatedTotal = subtotal + shipping_fee;
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
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const order = await Order.findById(order_id).session(session);
      if (!order) {
        throw new Error("Order not found");
      }

      if (order.order_status === "confirmed") {
        throw new Error("Confirmed order cannot be canceled")
      }

      const orderItems = await OrderItem.find({ order_id }).session(session);

      for (const item of orderItems) {
        await Product.findByIdAndUpdate(
          item.product_id,
          {
            $inc: {
              reserved_stock: -item.quantity,
            },
          },
          { session }
        );
      }

      const { reason = "" } = data;

      const history = await OrderStatusHistory.create(
        [
          {
            order_id: order_id,
            status: "cancelled",
            notes: reason,
            updated_by: user_id,
            updated_by_name: "",
            updated_by_type: "customer",
          },
        ],
        { session }
      );

      order.order_status = "cancelled";
      await order.save({ session });

      await session.commitTransaction();

      return history[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
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
