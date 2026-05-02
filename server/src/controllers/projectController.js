const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");

const createProject = async (req, res, next) => {
  try {
    const { name, description, members = [] } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const normalizedMembers = Array.isArray(members) ? members : [];
    const emailMembers = normalizedMembers.filter((member) => member.includes("@"));
    const idMembers = normalizedMembers.filter((member) => !member.includes("@"));

    const usersFromEmails = emailMembers.length
      ? await User.find({ email: { $in: emailMembers.map((email) => email.toLowerCase()) } }).select("_id")
      : [];

    const memberIds = [...idMembers, ...usersFromEmails.map((user) => user._id.toString())];

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: [...new Set([req.user._id.toString(), ...memberIds])],
    });

    return res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const query =
      req.user.role === "admin"
        ? {}
        : {
            $or: [{ members: req.user._id }, { createdBy: req.user._id }],
          };

    const projects = await Project.find(query)
      .populate("createdBy", "name email role")
      .populate("members", "name email role")
      .sort({ createdAt: -1 });

    return res.json(projects);
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await Task.deleteMany({ project: id });
    await Project.findByIdAndDelete(id);

    return res.json({ message: "Project deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createProject, getProjects, deleteProject };
