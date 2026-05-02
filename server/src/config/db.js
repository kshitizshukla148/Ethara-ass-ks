const mongoose = require("mongoose");
const { resolveMongoUri } = require("./env");

const connectDB = async () => {
  try {
    const mongoUri = resolveMongoUri();

    if (!mongoUri) {
      throw new Error(
        "Missing MongoDB URI. Set MONGO_URI in server/.env (or use MONGODB_URI / DATABASE_URL)."
      );
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
