const mongoose = require("mongoose");

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const isEmail = (value) =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const isObjectId = (value) => typeof value === "string" && mongoose.Types.ObjectId.isValid(value);

const isValidDate = (value) => {
  if (typeof value !== "string") return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime());
};

const validationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const validate = (validator) => (req, _res, next) => {
  try {
    validator(req);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  isNonEmptyString,
  isEmail,
  isObjectId,
  isValidDate,
  validationError,
  validate,
};
