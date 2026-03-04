const userModel = require("../models/userModel");

// Add product to user cart
const addToCart = async (req, res) => {
  try {
    const { itemId, size } = req.body;
    const userId = req.userId;

    if (!userId || !itemId || !size) {
      return res.status(400).json({
        success: false,
        message: "userId, itemId and size are required",
      });
    }

    const userData = await userModel.findById(userId).select("cartData");
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cartData = userData.cartData && typeof userData.cartData === "object" ? { ...userData.cartData } : {};
    const itemSizes = cartData[itemId] && typeof cartData[itemId] === "object" ? { ...cartData[itemId] } : {};

    itemSizes[size] = Number(itemSizes[size] || 0) + 1;
    cartData[itemId] = itemSizes;

    await userModel.findByIdAndUpdate(userId, { cartData });

    return res.json({ success: true, message: "Added to cart" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update product quantity in user cart
const updateCart = async (req, res) => {
  try {
    const { itemId, size, quantity } = req.body;
    const userId = req.userId;

    if (!userId || !itemId || !size || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "userId, itemId, size and quantity are required",
      });
    }

    const parsedQty = Number(quantity);
    if (Number.isNaN(parsedQty)) {
      return res.status(400).json({ success: false, message: "Quantity must be a number" });
    }

    const userData = await userModel.findById(userId).select("cartData");
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cartData = userData.cartData && typeof userData.cartData === "object" ? { ...userData.cartData } : {};
    const itemSizes = cartData[itemId] && typeof cartData[itemId] === "object" ? { ...cartData[itemId] } : {};

    if (parsedQty <= 0) {
      delete itemSizes[size];
      if (Object.keys(itemSizes).length === 0) {
        delete cartData[itemId];
      } else {
        cartData[itemId] = itemSizes;
      }
    } else {
      itemSizes[size] = parsedQty;
      cartData[itemId] = itemSizes;
    }

    await userModel.findByIdAndUpdate(userId, { cartData });

    return res.json({ success: true, message: "Cart updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get user cart data
const getUserCart = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }

    const userData = await userModel.findById(userId).select("cartData");
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      cartData: userData.cartData && typeof userData.cartData === "object" ? userData.cartData : {},
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addToCart, updateCart, getUserCart };
