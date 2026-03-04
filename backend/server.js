const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/mongodb");
const connectCloudinary = require("./config/cloudinary");
const userRouter = require("./routes/userRoute");
const productRouter = require("./routes/productRoute");
const cartRouter = require("./routes/cartRoute");
const orderRouter = require("./routes/orderRoute");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Ecommerce API running");
});

const PORT = process.env.PORT || 4000;
connectDB();
connectCloudinary();

console.log(
  `Gateway config -> Stripe: ${process.env.STRIPE_SECRET_KEY ? "OK" : "MISSING"}, Razorpay: ${
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET ? "OK" : "MISSING"
  }`
);

app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
