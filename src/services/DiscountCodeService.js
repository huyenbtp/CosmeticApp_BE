const DiscountCode = require("../models/DiscountCode");

const DiscountCodeService = {
  async validate(discount_id, subTotal, session) {
    if (!discount_id) return { discountAmount: 0 };

    const discountCode = await DiscountCode.findById(discount_id).session(session);
    if (!discountCode) throw new Error("Discount not found");

    if (!discountCode.is_active) {
      throw new Error("Discount is inactive");
    }

    const now = new Date();
    if (discountCode.start_date && discountCode.start_date > now) {
      throw new Error("Discount has not started yet");
    }
    if (discountCode.end_date && discountCode.end_date < now) {
      throw new Error("Discount has expired");
    }

    if (
      discountCode.min_order_value &&
      subTotal < discountCode.min_order_value
    ) {
      throw new Error("Order value does not meet discount condition");
    }

    if (
      discountCode.max_uses !== null &&
      discountCode.used_count >= discountCode.max_uses
    ) {
      throw new Error("Discount usage limit reached");
    }

    return { discountCode };
  },

  async getAllDiscountCodes() {
    return await DiscountCode.find();
  },

  async getDiscountCodeById(id) {
    return await DiscountCode.findById(id);
  },

  async createDiscountCode(data) {
    return await DiscountCode.create(data);
  },

  async updateDiscountCode(id, updateData) {
    return await DiscountCode.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  },

  async deleteDiscountCode(id) {
    return await DiscountCode.findByIdAndDelete(id);
  },
}

module.exports = DiscountCodeService;