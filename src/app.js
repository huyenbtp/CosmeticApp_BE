const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const authRoutes = require("./routes/auth.routes.js");
const brandRoutes = require("./routes/brand.routes.js");
const categoryRoutes = require("./routes/category.routes.js");
const customerRoutes = require("./routes/customer.routes.js");
const discountCodeRoutes = require("./routes/discountCode.routes.js");
const importItemRoutes = require("./routes/importItem.routes.js");
const orderItemRoutes = require("./routes/orderItem.routes.js");
const orderRoutes = require("./routes/order.routes.js");
const productImportRoutes = require("./routes/productImport.routes.js");
const productRoutes = require("./routes/product.routes.js");
const roleRoutes = require("./routes/role.routes.js");
const staffRoutes = require("./routes/staff.routes.js");
const skinTypeRoutes = require("./routes/skinType.routes.js");
const tagRoutes = require("./routes/tag.routes.js");
const userRoutes = require("./routes/user.routes.js");


const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// ROUTES
app.use("/auth", authRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart-items", cartItemRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/discount-codes", discountCodeRoutes);
app.use("/api/import-items", importItemRoutes);
app.use("/api/order-items", orderItemRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/product-imports", productImportRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/staffs", staffRoutes);
app.use("/api/skin-types", skinTypeRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wishlist-items", wishlistItemRoutes);


// health check
app.get("/health", (req, res) => {
  res.send("OK");
});

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

module.exports = app;