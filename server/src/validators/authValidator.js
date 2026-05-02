const { isEmail, isNonEmptyString, validate, validationError } = require("../middleware/validateRequest");

const validateSignup = validate((req) => {
  const { name, email, password, role } = req.body;

  if (!isNonEmptyString(name)) throw validationError("Name is required");
  if (!isEmail(email)) throw validationError("Valid email is required");
  if (!isNonEmptyString(password) || password.length < 6) {
    throw validationError("Password must be at least 6 characters");
  }
  if (role && !["admin", "member"].includes(role)) {
    throw validationError("Role must be either admin or member");
  }
});

const validateLogin = validate((req) => {
  const { email, password } = req.body;

  if (!isEmail(email)) throw validationError("Valid email is required");
  if (!isNonEmptyString(password)) throw validationError("Password is required");
});

module.exports = { validateSignup, validateLogin };
