const express = require("express");
const { createTask, deleteTask, getTasks, updateTask } = require("../controllers/taskController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { validateCreateTask, validateUpdateTask } = require("../validators/taskValidator");

const router = express.Router();

router.get("/", protect, getTasks);
router.post("/", protect, validateCreateTask, createTask);
router.put("/:id", protect, validateUpdateTask, updateTask);
router.delete("/:id", protect, authorizeRoles("admin"), deleteTask);

module.exports = router;
