const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const message =
    statusCode === 500 ? "Internal server error" : error.message || "Unexpected error";

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV !== "production" && statusCode === 500 ? { error: error.message } : {}),
  });
};

module.exports = { notFound, errorHandler };
