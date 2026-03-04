const express = require("express");
const adminAuth = require("../middleware/adminauth");
const userAuth = require("../middleware/userAuth");
const {
  placeOrder,
  placeOrderStripe,
  verifyStripe,
  placeOrderRazorpay,
  verifyRazorpay,
  allOrders,
  userOrders,
  updateStatus,
} = require("../controllers/orderController");

const orderRouter = express.Router();

orderRouter.post("/place", userAuth, placeOrder);
orderRouter.post("/stripe", userAuth, placeOrderStripe);
orderRouter.post("/verifyStripe", userAuth, verifyStripe);
orderRouter.post("/razorpay", userAuth, placeOrderRazorpay);
orderRouter.post("/verifyRazorpay", userAuth, verifyRazorpay);
orderRouter.post("/userorders", userAuth, userOrders);
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);

module.exports = orderRouter;
