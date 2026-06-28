const mongoose = require("mongoose");
const ProductReview = require("../models/ProductReview");
const OrderItem = require("../models/OrderItem");
const Customer = require("../models/Customer");

const ProductReviewService = {
  // Tạo nhiều review cùng lúc (cho 1 đơn hàng nhiều sản phẩm)
  async createReviews(userId, payload) {
    const { reviews, anonymous = false } = payload;

    if (!Array.isArray(reviews) || reviews.length === 0) {
      throw new Error("Danh sách đánh giá trống");
    }

    // Lấy tên khách hàng
    const customer = await Customer.findOne({ user_id: userId }).lean();
    const userFullName = customer?.full_name || "Người dùng";

    const created = [];

    for (const r of reviews) {
      const { product_id, order_item_id, rating, comment = "" } = r;
      // ===== VALIDATE comment 20–255 ký tự =====
      const len = comment.trim().length;
      if (len < 20) {
        throw new Error("Mỗi đánh giá phải có ít nhất 20 ký tự");
      }
      if (len > 255) {
        throw new Error("Mỗi đánh giá không được vượt quá 255 ký tự");
      }
      if (!order_item_id) {
        throw new Error("Thiếu order_item_id");
      }
      if (!order_item_id) {
        throw new Error("Thiếu order_item_id");
      }

      // Kiểm tra order item này có thuộc về user không (chống review hộ)
      const orderItem = await OrderItem.findById(order_item_id)
        .populate("order_id", "user_id order_status")
        .lean();

      if (!orderItem) {
        throw new Error("Không tìm thấy sản phẩm trong đơn");
      }
      if (String(orderItem.order_id.user_id) !== String(userId)) {
        throw new Error("Bạn không có quyền đánh giá sản phẩm này");
      }

      // Tránh review trùng (order_item_id là unique)
      const existed = await ProductReview.findOne({ order_item_id });
      if (existed) {
        // Đã review rồi thì bỏ qua, không báo lỗi
        continue;
      }

      const review = await ProductReview.create({
        product_id,
        user_id: userId,
        user_full_name: anonymous ? "Anonymous" : userFullName,
        order_item_id,
        rating,
        comment,
        anonymous,
      });
      created.push(review);
    }

    return { message: "Đánh giá thành công", count: created.length };
  },
  // Kiểm tra 1 đơn đã được review chưa (dựa trên order items)
  async checkOrderReviewed(orderId) {
    const items = await OrderItem.find({ order_id: orderId }).select("_id").lean();
    const itemIds = items.map((i) => i._id);
    const count = await ProductReview.countDocuments({
      order_item_id: { $in: itemIds },
    });
    // Đã review nếu số review >= số item
    return { reviewed: count >= itemIds.length && itemIds.length > 0 };
  },


  // Lấy danh sách review theo sản phẩm
  async getReviewsByProduct(productId) {
    const reviews = await ProductReview.find({ product_id: productId })
      .sort({ createdAt: -1 })
      .lean();

    return reviews.map((r) => ({
      _id: String(r._id),
      user_full_name: r.user_full_name,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    }));
  },
};

module.exports = ProductReviewService;
