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
        const orderItems = await OrderItem.find({ order_id }).session(session);

        const exportCode = await generateCode({
          entity: "productexport",
          prefix: "EXP",
          session,
        });

        let totalAmount = 0;
        let totalItems = 0;

        for (const item of orderItems) {
          totalAmount += item.unit_price * item.quantity;
          totalItems += item.quantity;
        }

        const exportDoc = await ProductExport.create(
          [{
            export_code: exportCode,
            created_by: profile._id,
            products_updated: orderItems.length,
            items_exported: totalItems,
            total_amount: totalAmount,
            order_id,
            type: "sales"
          }],
          { session }
        );

        const exportId = exportDoc[0]._id;

        for (const item of orderItems) {
          let remainingNeed = item.quantity;

          /**
           * FEFO:
           * 1. exp_date ASC
           * 2. remaining_qty ASC
           */
          const batches = await InventoryBatch.find({
            product_id: item.product_id,
            remaining_qty: { $gt: 0 },
          })
            .sort({
              exp_date: 1,
              remaining_qty: 1,
            })
            .session(session);

          let totalAvailable = batches.reduce((sum, b) => sum + b.remaining_qty, 0);

          if (totalAvailable < item.quantity) {
            throw new Error(`Insufficient stock for product ${item.product_id}`);
          }

          for (const batch of batches) {
            if (remainingNeed <= 0) { break; }

            const exportQty = Math.min(remainingNeed, batch.remaining_qty);

            batch.remaining_qty -= exportQty;

            await batch.save({ session });

            await ExportItem.create(
              [
                {
                  export_id: exportId,
                  product_id: item.product_id,
                  batch_id: batch._id,
                  unit_price: item.unit_price,
                  quantity: exportQty,
                },
              ],
              { session }
            );

            remainingNeed -= exportQty;
          }

          await Product.findByIdAndUpdate(
            item.product_id,
            {
              $inc: {
                total_stock: -item.quantity,
                reserved_stock: -item.quantity,
              },
            },
            { session }
          );
        }
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