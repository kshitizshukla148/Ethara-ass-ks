const Task = require("../models/Task");

const getDashboard = async (req, res, next) => {
  try {
    const baseQuery = req.user.role === "admin" ? {} : { assignedTo: req.user._id };
    const now = new Date();

    const tasks = await Task.find(baseQuery);

    const total = tasks.length;
    const todo = tasks.filter((task) => task.status === "todo").length;
    const inProgress = tasks.filter((task) => task.status === "in-progress").length;
    const done = tasks.filter((task) => task.status === "done").length;
    const overdue = tasks.filter((task) => task.status !== "done" && task.dueDate < now).length;

    return res.json({ total, todo, inProgress, done, overdue });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
