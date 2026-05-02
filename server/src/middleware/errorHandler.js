const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const isDatabaseAvailabilityError = (error) =>
  error.name === "MongooseServerSelectionError" ||
  /buffering timed out|server selection timed out/i.test(error.message || "");

const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || (isDatabaseAvailabilityError(error) ? 503 : 500);
  const message =
    statusCode === 503
      ? "Database unavailable. Check the MongoDB connection string and network access."
      : statusCode === 500
        ? "Internal server error"
        : error.message || "Unexpected error";

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV !== "production" && statusCode >= 500 ? { error: error.message } : {}),
  });
};

module.exports = { notFound, errorHandler };
