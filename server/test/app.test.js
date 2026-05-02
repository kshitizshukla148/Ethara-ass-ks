const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";

const app = require("../src/app");

test("GET /health returns healthy status", async () => {
  const res = await request(app).get("/health");

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, "ok");
  assert.equal(typeof res.body.uptime, "number");
});

test("POST /api/auth/signup rejects invalid payload", async () => {
  const res = await request(app).post("/api/auth/signup").send({
    name: "",
    email: "invalid-email",
    password: "123",
  });

  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /required|valid|Password/i);
});

test("POST /api/tasks requires auth token", async () => {
  const res = await request(app).post("/api/tasks").send({
    title: "Task",
    project: "507f1f77bcf86cd799439011",
    assignedTo: "507f1f77bcf86cd799439011",
    dueDate: "2026-05-02",
  });

  assert.equal(res.statusCode, 401);
  assert.match(res.body.message, /Not authorized/i);
});
