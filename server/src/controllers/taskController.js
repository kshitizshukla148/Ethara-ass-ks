const Task = require("../models/Task");
const Project = require("../models/Project");

const createTask = async (req, res, next) => {
  try {
    const { title, description, project, assignedTo, dueDate, status } = req.body;
    if (!title || !project || !assignedTo || !dueDate) {
      return res.status(400).json({
        message: "title, project, assignedTo, dueDate are required",
      });
    }

    const existingProject = await Project.findById(project);
    if (!existingProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      dueDate,
      status: status || "todo",
      createdBy: req.user._id,
    });

    return res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const query = req.user.role === "admin" ? {} : { assignedTo: req.user._id };
    const tasks = await Task.find(query)
      .populate("project", "name")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email")
      .sort({ dueDate: 1 });

    return res.json(tasks);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const isAdmin = req.user.role === "admin";
    const isAssignee = task.assignedTo.toString() === req.user._id.toString();
    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updates = req.body;
    const updatedTask = await Task.findByIdAndUpdate(id, updates, {
      returnDocument: "after",
      runValidators: true,
    })
      .populate("project", "name")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email");

    return res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await Task.findByIdAndDelete(id);

    return res.json({ message: "Task deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, deleteTask, getTasks, updateTask };
