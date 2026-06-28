const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ProductReviewController = require("../controllers/ProductReviewController");

// Xem review của 1 sản phẩm (công khai)
router.get("/product/:productId", ProductReviewController.getByProduct);

// Gửi đánh giá (phải đăng nhập)
router.post("/", auth, ProductReviewController.create);
//router.get("/check-order/:orderId", auth, ProductReviewController.checkOrder);

module.exports = router;
