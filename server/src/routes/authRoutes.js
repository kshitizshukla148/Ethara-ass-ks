const express = require("express");
const { signup, login, me, getUsers } = require("../controllers/authController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { validateSignup, validateLogin } = require("../validators/authValidator");

const router = express.Router();

router.post("/signup", validateSignup, signup);
router.post("/login", validateLogin, login);
router.get("/me", protect, me);
router.get("/users", protect, authorizeRoles("admin"), getUsers);

module.exports = router;
