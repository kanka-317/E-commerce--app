const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Route for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // checking user already exists or not
    const user = await userModel.findOne({ email: normalizedEmail });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }

    // comparing password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user._id);
    return res.json({
      success: true,
      message: "User logged in successfully",
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Route for user register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // validating email format & strong password
    if (!validator.isEmail(normalizedEmail)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email" });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Please enter a strong password (min 8 characters)",
      });
    }

    // checking user already exists or not
    const exists = await userModel.findOne({ email: normalizedEmail });
    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const token = createToken(user._id);

    return res.json({
      success: true,
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Route for admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminEmail =
      process.env.ADMIN_EMAIL ||
      process.env.ADMIN_USER_EMAIL ||
      process.env.ADMIN_USERNAME;
    const adminPassword =
      process.env.ADMIN_PASSWORD ||
      process.env.ADMIN_PASS ||
      process.env.ADMIN_USER_PASSWORD;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    if (!adminEmail || !adminPassword) {
      return res.status(500).json({
        success: false,
        message:
          "Admin credentials are not configured in environment. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env and restart server.",
      });
    }

    if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid admin credentials" });
    }

    if (password !== adminPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid admin credentials" });
    }

    const token = jwt.sign({ role: "admin", email: adminEmail }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      success: true,
      message: "Admin logged in successfully",
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { loginUser, registerUser, adminLogin };
