const express = require("express");
const { addToCart, getUserCart, updateCart } = require("../controllers/cartController");
const userAuth = require("../middleware/userAuth");

const cartRouter = express.Router();

cartRouter.post("/get", userAuth, getUserCart);
cartRouter.post("/add", userAuth, addToCart);
cartRouter.post("/update", userAuth, updateCart);

module.exports = cartRouter;
