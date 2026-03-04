const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const crypto = require("crypto");
const Razorpay = require("razorpay");
const Stripe = require("stripe");
const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");
const envFilePath = path.join(__dirname, "..", ".env");

const currency = (process.env.CURRENCY || "usd").toLowerCase();
const deliveryCharge = Number(process.env.DELIVERY_CHARGE || 10);

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

const cleanEnvValue = (value) => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed.replace(/^['"]|['"]$/g, "").trim();
};

const readEnvFromCandidates = (candidates) => {
  for (const key of candidates) {
    const value = cleanEnvValue(process.env[key]);
    if (value) return value;
  }
  return "";
};

const getRazorpayGateway = () => {
  // Reload backend/.env so new keys work without needing server restart.
  require("dotenv").config({ path: envFilePath, override: true, quiet: true });

  const keyId = readEnvFromCandidates(["RAZORPAY_KEY_ID", "RAZORPAY_ID", "RAZORPAY_API_KEY"]);
  const keySecret = readEnvFromCandidates([
    "RAZORPAY_KEY_SECRET",
    "RAZORPAY_SECRET",
    "RAZORPAY_API_SECRET",
  ]);
  const missingKeys = [];
  if (!keyId) missingKeys.push("RAZORPAY_KEY_ID");
  if (!keySecret) missingKeys.push("RAZORPAY_KEY_SECRET");

  return {
    keyId,
    keySecret,
    missingKeys,
    client: keyId && keySecret ? new Razorpay({ key_id: keyId, key_secret: keySecret }) : null,
  };
};

const getErrorMessage = (error, fallbackMessage) => {
  if (!error) return fallbackMessage;
  if (typeof error === "string") return error;

  const candidates = [
    error.message,
    error.description,
    error.error?.description,
    error.error?.message,
    error.response?.data?.message,
    error.response?.data?.error?.description,
    error.response?.data?.error?.message,
    typeof error.response?.data?.error === "string" ? error.response.data.error : "",
  ];

  const message = candidates.find((item) => typeof item === "string" && item.trim());
  return message ? message.trim() : fallbackMessage;
};

const normalizeAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
};

const placeOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, amount, address } = req.body;
    const parsedAmount = normalizeAmount(amount);

    if (!userId || !Array.isArray(items) || items.length === 0 || !parsedAmount || !address) {
      return res.status(400).json({
        success: false,
        message: "items, amount and address are required",
      });
    }

    const orderData = {
      userId,
      items,
      amount: parsedAmount,
      address,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    return res.status(201).json({
      success: true,
      message: "Order Placed",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const placeOrderStripe = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: "Stripe is not configured. Add STRIPE_SECRET_KEY to your backend .env",
      });
    }

    const userId = req.userId;
    const { items, amount, address } = req.body;
    const parsedAmount = normalizeAmount(amount);

    if (!userId || !Array.isArray(items) || items.length === 0 || !parsedAmount || !address) {
      return res.status(400).json({
        success: false,
        message: "items, amount and address are required",
      });
    }

    const orderData = {
      userId,
      items,
      amount: parsedAmount,
      address,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const lineItems = items
      .map((item) => {
        const price = Number(item?.price || 0);
        const quantity = Math.max(1, Number(item?.quantity || 1));
        const unitAmount = Math.round(price * 100);

        if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
          return null;
        }

        return {
          price_data: {
            currency,
            product_data: {
              name: item?.name || "Product",
            },
            unit_amount: unitAmount,
          },
          quantity,
        };
      })
      .filter(Boolean);

    if (lineItems.length === 0) {
      await orderModel.findByIdAndDelete(newOrder._id);
      return res.status(400).json({
        success: false,
        message: "Valid order items are required for Stripe checkout",
      });
    }

    if (deliveryCharge > 0) {
      lineItems.push({
        price_data: {
          currency,
          product_data: { name: "Delivery Charges" },
          unit_amount: Math.round(deliveryCharge * 100),
        },
        quantity: 1,
      });
    }

    const origin =
      req.headers.origin ||
      process.env.FRONTEND_URL ||
      process.env.CLIENT_URL ||
      "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/verify?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/verify?success=false&session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        orderId: String(newOrder._id),
        userId: String(userId),
      },
    });

    return res.json({
      success: true,
      session_url: session.url,
      session_id: session.id,
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const verifyStripe = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: "Stripe is not configured. Add STRIPE_SECRET_KEY to your backend .env",
      });
    }

    const userId = req.userId;
    const { sessionId, orderId, success } = req.body;
    let resolvedOrderId = orderId;
    let isPaid = success === true || success === "true";

    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session?.metadata?.orderId) {
        resolvedOrderId = session.metadata.orderId;
      }
      isPaid = session?.payment_status === "paid";
    }

    if (!resolvedOrderId) {
      return res.status(400).json({
        success: false,
        message: "orderId or sessionId is required",
      });
    }

    if (isPaid) {
      await orderModel.findOneAndUpdate(
        { _id: resolvedOrderId, userId },
        { payment: true }
      );
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      return res.json({ success: true, message: "Payment verified" });
    }

    await orderModel.findOneAndDelete({ _id: resolvedOrderId, userId });
    return res.json({ success: false, message: "Payment not completed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const placeOrderRazorpay = async (req, res) => {
  let createdOrderId = null;

  try {
    const { client: razorpay, keyId: razorpayKeyId, missingKeys } = getRazorpayGateway();

    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: `Razorpay is not configured. Missing ${missingKeys.join(
          ", "
        )} in backend/.env`,
      });
    }

    const userId = req.userId;
    const { items, amount, address } = req.body;
    const parsedAmount = normalizeAmount(amount);

    if (!userId || !Array.isArray(items) || items.length === 0 || !parsedAmount || !address) {
      return res.status(400).json({
        success: false,
        message: "items, amount and address are required",
      });
    }

    const orderData = {
      userId,
      items,
      amount: parsedAmount,
      address,
      paymentMethod: "Razorpay",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();
    createdOrderId = newOrder._id;

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(parsedAmount * 100),
      currency: (process.env.RAZORPAY_CURRENCY || "INR").toUpperCase(),
      receipt: String(newOrder._id),
    });

    return res.json({
      success: true,
      order: razorpayOrder,
      key: razorpayKeyId,
      orderId: newOrder._id,
    });
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Unable to create Razorpay order");
    console.error("Razorpay create order error:", errorMessage, error);

    if (createdOrderId) {
      try {
        await orderModel.findByIdAndDelete(createdOrderId);
      } catch (cleanupError) {
        console.error("Razorpay order cleanup error:", cleanupError);
      }
    }

    return res.status(500).json({ success: false, message: errorMessage });
  }
};

const verifyRazorpay = async (req, res) => {
  try {
    const { keySecret: razorpayKeySecret, missingKeys } = getRazorpayGateway();
    const userId = req.userId;
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "orderId, razorpay_order_id, razorpay_payment_id and razorpay_signature are required",
      });
    }

    if (!razorpayKeySecret) {
      return res.status(500).json({
        success: false,
        message: `Razorpay secret is not configured. Missing ${missingKeys.join(", ")} in backend/.env`,
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      await orderModel.findOneAndDelete({ _id: orderId, userId });
      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay signature",
      });
    }

    await orderModel.findOneAndUpdate({ _id: orderId, userId }, { payment: true });
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    return res.json({
      success: true,
      message: "Payment verified",
    });
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Unable to verify Razorpay payment");
    console.error("Razorpay verify error:", errorMessage, error);
    return res.status(500).json({ success: false, message: errorMessage });
  }
};

const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ date: -1 });
    return res.json({ success: true, orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const userOrders = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: "Unauthorized user" });
    }

    const orders = await orderModel.find({ userId }).sort({ date: -1 });
    return res.json({ success: true, orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "orderId and status are required",
      });
    }

    await orderModel.findByIdAndUpdate(orderId, { status });
    return res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  placeOrder,
  placeOrderStripe,
  verifyStripe,
  placeOrderRazorpay,
  verifyRazorpay,
  allOrders,
  userOrders,
  updateStatus,
};
