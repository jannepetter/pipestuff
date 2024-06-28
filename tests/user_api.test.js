const app = require("../app");
const { test, after, describe, beforeEach } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const User = require("../models/user");
const helper = require("./test_helper");

const api = supertest(app);

describe("user api tests", () => {
  beforeEach(async () => {
    await helper.initDB();
  });

  test("users can be fetched", async () => {
    const result = await api.get("/api/users").expect(200);
    assert.deepStrictEqual(result.body, [
      {
        blogs: [
          {
            author: "test author",
            id: result.body[0].blogs[0].id,
            title: "test blog 1",
            url: "somewhere",
          },
          {
            author: "another author",
            id: result.body[0].blogs[1].id,
            title: "test blog 2",
            url: "theurlhere",
          },
        ],
        username: "testuser",
        name: "test",
        id: result.body[0].id,
      },
      {
        blogs: [],
        username: "someuser",
        name: "someuser",
        id: result.body[1].id,
      },
    ]);
  });

  test("user can be created", async () => {
    const result = await api.post("/api/users").expect(201).send({
      username: "newUser",
      password: "userpassword",
      name: "newuser",
    });

    assert.deepStrictEqual(result.body, {
      username: "newUser",
      name: "newuser",
      id: result.body.id,
    });
    const users = await helper.usersInDb();
    assert.strictEqual(users.length, helper.initialUsers.length + 1);
  });

  test("user cannot be created with too short username", async () => {
    const result = await api.post("/api/users").expect(400).send({
      username: "ne",
      password: "userpassword",
      name: "newuser",
    });

    assert.deepStrictEqual(result.body, {
      error:
        "User validation failed: username: Path `username` (`ne`) is shorter than the minimum allowed length (3).",
    });
  });

  test("user cannot be created with too short password", async () => {
    const result = await api.post("/api/users").expect(400).send({
      username: "newUser",
      password: "us",
      name: "newuser",
    });

    assert.deepStrictEqual(result.body, {
      error: "password needs to be at least 3 characters long",
    });
  });
});

after(async () => {
  await mongoose.connection.close();
});
