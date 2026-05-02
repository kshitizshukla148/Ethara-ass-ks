const {
  isNonEmptyString,
  isObjectId,
  isValidDate,
  validate,
  validationError,
} = require("../middleware/validateRequest");

const VALID_STATUS = ["todo", "in-progress", "done"];

const validateCreateTask = validate((req) => {
  const { title, project, assignedTo, dueDate, status } = req.body;

  if (!isNonEmptyString(title)) throw validationError("Task title is required");
  if (!isObjectId(project)) throw validationError("Valid project id is required");
  if (!isObjectId(assignedTo)) throw validationError("Valid assignedTo user id is required");
  if (!isValidDate(dueDate)) throw validationError("Valid dueDate is required");
  if (status && !VALID_STATUS.includes(status)) {
    throw validationError("Status must be one of: todo, in-progress, done");
  }
});

const validateUpdateTask = validate((req) => {
  const { id } = req.params;
  const { title, project, assignedTo, dueDate, status } = req.body;

  if (!isObjectId(id)) throw validationError("Valid task id is required");

  if (title !== undefined && !isNonEmptyString(title)) {
    throw validationError("Title cannot be empty");
  }
  if (project !== undefined && !isObjectId(project)) {
    throw validationError("Project must be a valid id");
  }
  if (assignedTo !== undefined && !isObjectId(assignedTo)) {
    throw validationError("assignedTo must be a valid user id");
  }
  if (dueDate !== undefined && !isValidDate(dueDate)) {
    throw validationError("dueDate must be a valid date");
  }
  if (status !== undefined && !VALID_STATUS.includes(status)) {
    throw validationError("Status must be one of: todo, in-progress, done");
  }
});

module.exports = { validateCreateTask, validateUpdateTask };
