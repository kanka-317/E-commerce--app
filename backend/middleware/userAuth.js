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

const userAuth = (req, res, next) => {
  try {
    const token = getToken(req);
    if (!token) {
      return res.status(401).json({ success: false, message: "No Authorization login again" });
    }

    const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId =
      tokenDecoded && typeof tokenDecoded === "object"
        ? tokenDecoded.id
        : typeof tokenDecoded === "string"
          ? tokenDecoded
          : "";

    if (!userId) {
      return res.status(401).json({ success: false, message: "Invalid Authorization login again" });
    }

    req.userId = userId;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ success: false, message: error.message });
  }
};

module.exports = userAuth;
