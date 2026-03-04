const express = require("express");
const {
  listProducts,
  addProduct,
  removeProduct,
  singleProduct,
} = require("../controllers/productController");
const upload = require("../middleware/multer");
const adminAuth = require("../middleware/adminauth");

const productRouter = express.Router();

productRouter.route("/add").get(upload.any(),adminAuth, addProduct).post(upload.any(), adminAuth, addProduct);
productRouter.post("/remove", adminAuth, removeProduct);
productRouter.get("/remove", adminAuth, removeProduct);
productRouter.post("/single", adminAuth, singleProduct);
productRouter.get("/single", adminAuth, singleProduct);
productRouter.get("/list", listProducts);

module.exports = productRouter;
