const jwt = require("jsonwebtoken");

const getToken = (req) => {
  const directToken = req.headers?.token;
  if (typeof directToken === "string" && directToken.trim()) {
    return directToken.trim();
  }

  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  return "";
};

const adminAuth = (req, res, next) => {
  try {
    const token = getToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No Authorization login again",
      });
    }

    const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET);
    const adminEmail =
      process.env.ADMIN_EMAIL ||
      process.env.ADMIN_USER_EMAIL ||
      process.env.ADMIN_USERNAME;
    const adminPassword =
      process.env.ADMIN_PASSWORD ||
      process.env.ADMIN_PASS ||
      process.env.ADMIN_USER_PASSWORD;

    const isLegacyToken =
      typeof tokenDecoded === "string" &&
      adminEmail &&
      adminPassword &&
      tokenDecoded === adminEmail + adminPassword;

    const isRoleToken =
      tokenDecoded &&
      typeof tokenDecoded === "object" &&
      tokenDecoded.role === "admin" &&
      typeof tokenDecoded.email === "string" &&
      adminEmail &&
      tokenDecoded.email.trim().toLowerCase() === adminEmail.trim().toLowerCase();

    if (!isLegacyToken && !isRoleToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid Authorization login again",
      });
    }

    req.admin = tokenDecoded;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ success: false, message: error.message });
  }
};

module.exports = adminAuth;
