const { isNonEmptyString, validate, validationError } = require("../middleware/validateRequest");

const validateCreateProject = validate((req) => {
  const { name, members } = req.body;

  if (!isNonEmptyString(name)) throw validationError("Project name is required");

  if (members !== undefined) {
    if (!Array.isArray(members)) {
      throw validationError("Members must be an array");
    }
    if (!members.every((member) => typeof member === "string" && member.trim().length > 0)) {
      throw validationError("Each member must be a non-empty string");
    }
  }
});

module.exports = { validateCreateProject };
