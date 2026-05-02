const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

const allowedOrigins = new Set([
  "http://localhost:5173",
  "https://ethara-ass.vercel.app",
  "https://ethara-ls0a5uvof-kshitizshukla148s-projects.vercel.app",
  ...(process.env.CLIENT_URLS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL.trim()] : []),
]);

const isAllowedVercelPreview = (origin) =>
  /^https:\/\/ethara-ass(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(origin);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients (no Origin header), local dev, and configured frontends.
      if (!origin || allowedOrigins.has(origin) || isAllowedVercelPreview(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

app.get("/api", (_req, res) => {
  res.json({ message: "Team Task Manager API is running" });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);

const clientBuildPath = path.join(__dirname, "..", "..", "client", "dist");

if (fs.existsSync(path.join(clientBuildPath, "index.html"))) {
  const sendClientApp = (res, next) => {
    fs.readFile(path.join(clientBuildPath, "index.html"), "utf8", (err, html) => {
      if (err) return next(err);
      res.type("html").send(html.replaceAll(" crossorigin", ""));
    });
  };

  app.get("/", (_req, res, next) => {
    sendClientApp(res, next);
  });

  app.use(express.static(clientBuildPath));

  app.use((req, res, next) => {
    if (req.method !== "GET") return next();
    if (req.path.startsWith("/api")) return next();

    sendClientApp(res, next);
  });
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
