const mongoose = require("mongoose");
const OrderStatusHistory = require("../models/OrderStatusHistory");
const User = require("../models/User");
const Customer = require("../models/Customer");
const Staff = require("../models/Staff");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");
const InventoryBatch = require("../models/InventoryBatch");
const ProductExport = require("../models/ProductExport");
const ExportItem = require("../models/ExportItem");
const generateCode = require("../utils/codeGenerator");
const ProductExportService = require("./ProductExportService");

const statusType = ["pending", "confirmed", "packed", "shipping", "delivered", "cancelled", "returned"];

const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PACKED: "packed",
  SHIPPING: "shipping",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  RETURNED: "returned",
};

const ALLOWED_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.CANCELLED,
  ],

  [ORDER_STATUS.CONFIRMED]: [
    ORDER_STATUS.PACKED,
    ORDER_STATUS.CANCELLED,
  ],

  [ORDER_STATUS.PACKED]: [
    ORDER_STATUS.SHIPPING,
    ORDER_STATUS.CANCELLED,
  ],

  [ORDER_STATUS.SHIPPING]: [
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.RETURNED,
  ],

  [ORDER_STATUS.DELIVERED]: [
    ORDER_STATUS.RETURNED,
  ],

  [ORDER_STATUS.CANCELLED]: [],

  [ORDER_STATUS.RETURNED]: [],
};

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

  async create(
    user_id,
    userRole = "staff",
    order_id,
    newStatus = "pending",
    notes = ""
  ) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const order = await Order.findById(order_id).session(session);
      if (!order) {
        throw new Error("Order not found");
      }

      const currentStatus = order.order_status;
      const allowedNextStatuses = ALLOWED_TRANSITIONS[currentStatus] || [];
      const isValidTransition = allowedNextStatuses.includes(newStatus);

      if (!isValidTransition) {
        throw new Error(`Cannot change status from "${currentStatus}" to "${newStatus}"`);
      }

      const user = await User.findById(user_id).session(session);
      if (!user) {
        throw new Error("User not found");
      }

      let profile;

      if (userRole !== "customer") {
        profile = await Staff.findOne({ user_id }).session(session);
        if (!profile) {
          throw new Error("Staff not found");
        }
      } else {
        if (![pending, delivered, cancelled].includes(newStatus)) {
          throw new Error("Forbidden")
        }
        profile = await Customer.findOne({ user_id }).session(session);
        if (!profile) {
          throw new Error("Customer not found");
        }
      }

      /**
       * Tạo phiếu xuất khi chuyển sang packed
       */
      if (currentStatus === "confirmed" && newStatus === "packed") {
        await ProductExportService.createSalesProductExport({
          staff_id: profile._id,
          order_id,
          session,
        });
      }

      if (newStatus === "cancelled") {
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
      }

      order.order_status = newStatus;
      await order.save({ session });

      const history = await OrderStatusHistory.create(
        [
          {
            order_id,
            status: newStatus,
            notes,
            updated_by: user_id,
            updated_by_name: profile.full_name,
            updated_by_type: userRole,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      return history[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  async delete(id) {
    return await OrderStatusHistory.findByIdAndDelete(id);
  }
}

module.exports = OrderStatusHistoryService;