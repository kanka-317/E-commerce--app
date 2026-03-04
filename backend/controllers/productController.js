const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");
const path = require("path");
const productModel = require("../models/productModel");

// ================= ADD PRODUCT =================
const addProduct = async (req, res) => {
  try {
    const body = { ...(req.query || {}), ...(req.body || {}) };
    const { name, description, price, category, subCategory, sizes, bestseller } = body;

    if (!name || !description || !price || !category || !subCategory) {
      return res.status(400).json({
        success: false,
        message: "name, description, price, category and subCategory are required",
      });
    }

    let uploadedFiles = [];
    if (Array.isArray(req.files)) {
      uploadedFiles = req.files.filter(Boolean);
    } else if (req.files && typeof req.files === "object") {
      uploadedFiles = Object.values(req.files).flat().filter(Boolean);
    }

    const assetDir = path.resolve(__dirname, "../../frontend/src/assets");
    const imageKeys = ["image1", "image2", "image3", "image4"];
    const imageSources = imageKeys
      .map((key) => body[key])
      .filter((value) => typeof value === "string" && value.trim())
      .map((value) => value.trim())
      .map((value) => {
        if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) {
          return value;
        }
        if (path.isAbsolute(value) && fs.existsSync(value)) {
          return value;
        }
        const fromAssets = path.join(assetDir, value);
        if (fs.existsSync(fromAssets)) {
          return fromAssets;
        }
        const fromCwd = path.resolve(process.cwd(), value);
        if (fs.existsSync(fromCwd)) {
          return fromCwd;
        }
        return null;
      })
      .filter(Boolean);

    if (uploadedFiles.length === 0 && imageSources.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload product images",
      });
    }

    let imagesUrl = [];
    if (uploadedFiles.length > 0) {
      imagesUrl = await Promise.all(
        uploadedFiles.map(async (item) => {
          const result = await cloudinary.uploader.upload(item.path, {
            resource_type: "image",
          });
          return result.secure_url;
        })
      );
    } else {
      imagesUrl = await Promise.all(
        imageSources.map(async (source) => {
          const result = await cloudinary.uploader.upload(source, {
            resource_type: "image",
          });
          return result.secure_url;
        })
      );
    }

    let parsedSizes = [];
    if (Array.isArray(sizes)) {
      parsedSizes = sizes;
    } else if (typeof sizes === "string" && sizes.trim()) {
      try {
        parsedSizes = JSON.parse(sizes.replace(/'/g, '"'));
      } catch (error) {
        parsedSizes = [sizes];
      }
    }

    const productData = {
      name,
      description,
      category,
      price: Number(price),
      subCategory,
      bestseller: String(bestseller).toLowerCase() === "true",
      sizes: parsedSizes,
      image: imagesUrl,
      date: Date.now(),
    };

    const product = new productModel(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: "Product Added Successfully",
      product
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================= LIST PRODUCTS =================
const listProducts = async (req, res) => {
  try {

    const products = await productModel.find({});

    res.json({
      success: true,
      products
    });

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// ================= REMOVE PRODUCT =================
const removeProduct = async (req, res) => {
  try {

    const { id } = req.body;

    await productModel.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Product Removed"
    });

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// ================= SINGLE PRODUCT =================
const singleProduct = async (req, res) => {
  try {

    const { id } = req.body;

    const product = await productModel.findById(id);

    res.json({
      success: true,
      product
    });

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  addProduct,
  listProducts,
  removeProduct,
  singleProduct
};
