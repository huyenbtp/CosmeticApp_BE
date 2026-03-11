const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const authRoutes = require("./routes/auth.routes.js");
const brandRoutes = require("./routes/brand.routes.js");
const categoryRoutes = require("./routes/category.routes.js");
const customerRoutes = require("./routes/customer.routes.js");
const discountCodeRoutes = require("./routes/discountcode.routes.js");
const importDetailRoutes = require("./routes/importDetail.routes.js");
const orderDetailRoutes = require("./routes/orderdetail.routes.js");
const orderRoutes = require("./routes/order.routes.js");
const pointTransactionRoutes = require("./routes/pointtransaction.routes.js");
const productImportRoutes = require("./routes/productImport.routes.js");
const productRoutes = require("./routes/product.routes.js");
const staffRoutes = require("./routes/staff.routes.js");


const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/discount-codes", discountCodeRoutes);
app.use("/api/import-details", importDetailRoutes);
app.use("/api/order-details", orderDetailRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/point-transactions", pointTransactionRoutes);
app.use("/api/products", productRoutes);
app.use("/api/product-imports", productImportRoutes);
app.use("/api/staffs", staffRoutes);

module.exports = app;