const connectDB = require("./config/db");
const { requiredEnvChecks } = require("./config/env");
const app = require("./app");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  requiredEnvChecks();
  await connectDB();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});
