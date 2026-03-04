const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI or MONGO_URI in .env");
  }

  mongoose.connection.on("connected", () => {
    console.log("DB Connected");
  });

  await mongoose.connect(mongoUri, {
    dbName: process.env.MONGO_DB_NAME || "e-commerce",
  });
};

module.exports = connectDB;