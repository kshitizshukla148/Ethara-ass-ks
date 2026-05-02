const crypto = require("crypto");


const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const getEnv = (key, fallback = "") => {
  const value = process.env[key];
  return typeof value === "string" ? value.trim() : fallback;
};

const resolveMongoUri = () =>
  getEnv("MONGO_URI") || getEnv("MONGODB_URI") || getEnv("DATABASE_URL");

const requiredEnvChecks = () => {
  const mongoUri = resolveMongoUri();
  const jwtSecret = getEnv("JWT_SECRET");

  const missing = [];
  if (!mongoUri) missing.push("MONGO_URI (or MONGODB_URI / DATABASE_URL)");
  if (!jwtSecret) missing.push("JWT_SECRET");

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. Configure server/.env before starting the API.`
    );
  }

  return { mongoUri, jwtSecret };
};

module.exports = {
  requiredEnvChecks,
  resolveMongoUri,
};
