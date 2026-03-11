const PointTransaction = require("../models/PointTransaction");

const PointTransactionService = {
  async applyOrderPoints({
    customer,
    orderId,
    totalAmount,
    pointsUsed,
    session,
  }) {
    let earnedPoints = Math.floor(totalAmount / 100); // 1 điểm / 100đ

    /* ---------- TRỪ ĐIỂM ---------- */
    if (pointsUsed > 0) {
      customer.points -= pointsUsed;

      await PointTransaction.create(
        [
          {
            customer_id: customer._id,
            order_id: orderId,
            points_change: -pointsUsed,
          },
        ],
        { session }
      );
    }

    /* ---------- CỘNG ĐIỂM ---------- */
    if (earnedPoints > 0) {
      customer.points += earnedPoints;

      await PointTransaction.create(
        [
          {
            customer_id: customer._id,
            order_id: orderId,
            points_change: earnedPoints,
          },
        ],
        { session }
      );
    }

    await customer.save({ session });

    return;
  },

  async createPointTransaction(data) {
    return await PointTransaction.create(data);
  },

  async getAllPointTransactions() {
    return await PointTransaction.find();
  },

  async getPointTransactionById(id) {
    return await PointTransaction.findById(id);
  },

  async updatePointTransaction(id, updateData) {
    return await PointTransaction.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  },

  async deletePointTransaction(id) {
    return await PointTransaction.findByIdAndDelete(id);
  },
}

module.exports = PointTransactionService;
