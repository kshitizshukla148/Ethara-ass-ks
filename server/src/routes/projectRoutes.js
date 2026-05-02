const express = require("express");
const { createProject, deleteProject, getProjects } = require("../controllers/projectController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { validateCreateProject } = require("../validators/projectValidator");

const router = express.Router();

router.get("/", protect, getProjects);
router.post("/", protect, authorizeRoles("admin"), validateCreateProject, createProject);
router.delete("/:id", protect, authorizeRoles("admin"), deleteProject);

module.exports = router;
