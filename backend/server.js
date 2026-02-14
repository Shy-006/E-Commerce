import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";

import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* ================= Middleware ================= */

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

/* ================= API Routes ================= */

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

/* ================= Health Check ================= */

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

/* ================= Start Server ================= */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});
