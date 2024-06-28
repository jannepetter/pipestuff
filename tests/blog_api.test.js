const app = require("../app");
const { test, after, describe, beforeEach, before } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const Blog = require("../models/blog");
const User = require("../models/user");
const helper = require("./test_helper");

const api = supertest(app);

describe("blog api tests", () => {
  let token;

  beforeEach(async () => {
    const users = await helper.initDB();
    const result = await api.post("/api/login").send({
      username: users[0].username,
      password: users[0].password,
    });
    token = "Bearer " + result.body.token;
  });

  test("blogs are returned as json", async () => {
    const result = await api
      .get("/api/blogs")
      .set({ authorization: token })
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.deepStrictEqual(result.body, [
      {
        title: "test blog 1",
        author: "test author",
        url: "somewhere",
        likes: 0,
        user: {
          username: "testuser",
          name: "test",
          id: result.body[0].user.id,
        },
        id: result.body[0].id,
      },
      {
        title: "test blog 2",
        author: "another author",
        url: "theurlhere",
        likes: 0,
        user: {
          username: "testuser",
          name: "test",
          id: result.body[0].user.id,
        },
        id: result.body[1].id,
      },
    ]);
  });

  test("single blog can be fetched", async () => {
    const blogs = await helper.blogsInDb();
    const result = await api
      .get(`/api/blogs/${blogs[0].id}`)
      .set("authorization", token)
      .expect(200);

    assert.deepStrictEqual(result.body, {
      title: "test blog 1",
      author: "test author",
      url: "somewhere",
      likes: 0,
      user: {
        username: "testuser",
        name: "test",
        id: result.body.user.id,
      },
      id: result.body.id,
    });
  });
  test("posting a blog requires a token", async () => {
    const newBlog = {
      title: "test blog",
      author: "test author",
      url: "somewhere",
      likes: 0,
    };

    const response = await api.post("/api/blogs").send(newBlog).expect(401);
    assert.deepStrictEqual(response.body, {
      error: "token missing or expired",
    });
  });

  test("blog can be posted", async () => {
    const newBlog = {
      title: "test blog",
      author: "test author",
      url: "somewhere",
      likes: 0,
    };

    const response = await api
      .post("/api/blogs")
      .set("authorization", token)
      .send(newBlog)
      .expect(201);
    assert.deepStrictEqual(response.body, {
      title: "test blog",
      author: "test author",
      url: "somewhere",
      likes: 0,
      user: {
        username: "testuser",
        name: "test",
        id: response.body.user.id,
      },
      id: response.body.id,
    });
    assert.strictEqual(helper.initialBlogs.length, 2);
    const newBlogs = await helper.blogsInDb();
    assert.strictEqual(newBlogs.length, 3);
  });

  test("value of likes will be set to zero if not given", async () => {
    const newBlog = {
      title: "no likes set",
      author: "some author",
      url: "somewhere",
    };

    const response = await api
      .post("/api/blogs")
      .set("authorization", token)
      .send(newBlog)
      .expect(201);
    assert.deepStrictEqual(response.body, {
      title: "no likes set",
      author: "some author",
      url: "somewhere",
      likes: 0,
      user: {
        username: "testuser",
        name: "test",
        id: response.body.user.id,
      },
      id: response.body.id,
    });
    assert.strictEqual(helper.initialBlogs.length, 2);
    const newBlogs = await helper.blogsInDb();
    assert.strictEqual(newBlogs.length, 3);
  });

  test("creating blog without a title, gives status 400", async () => {
    const newBlog = {
      author: "some author",
      url: "somewhere",
      likes: 0,
    };

    const response = await api
      .post("/api/blogs")
      .set("authorization", token)
      .send(newBlog)
      .expect(400);
    assert.deepStrictEqual(response.body, {
      error: "Blog validation failed: title: Path `title` is required.",
    });
  });

  test("creating a blog without url, gives status 400", async () => {
    const newBlog = {
      title: "some title",
      author: "some author",
      likes: 0,
    };

    const response = await api
      .post("/api/blogs")
      .set("authorization", token)
      .send(newBlog)
      .expect(400);
    assert.deepStrictEqual(response.body, {
      error: "Blog validation failed: url: Path `url` is required.",
    });
  });

  test("blog can be deleted", async () => {
    const blogs = await helper.blogsInDb();
    assert.strictEqual(blogs.length, 2);

    await api
      .delete(`/api/blogs/${blogs[0].id}`)
      .set("authorization", token)
      .expect(204);

    const newBlogs = await helper.blogsInDb();
    assert.strictEqual(newBlogs.length, 1);
  });

  test("blog cannot be deleted without token", async () => {
    const blogs = await helper.blogsInDb();

    const response = await api.delete(`/api/blogs/${blogs[0].id}`).expect(401);
    assert.deepStrictEqual(response.body, {
      error: "token missing or expired",
    });
  });

  test("blog cannot be deleted by another user", async () => {
    const blogs = await helper.blogsInDb();
    const anotherUser = helper.initialUsers[1];
    const loginResponse = await api.post("/api/login").send({
      username: anotherUser.username,
      password: anotherUser.password,
    });

    const response = await api
      .delete(`/api/blogs/${blogs[0].id}`)
      .set({ authorization: "Bearer " + loginResponse.body.token })
      .expect(401);
    assert.deepStrictEqual(response.body, {
      error: "cannot delete blog posted by other user",
    });
  });

  test("blog can be updated", async () => {
    const blogs = await helper.blogsInDb();
    const blogToUpdate = {
      ...blogs[0],
      likes: 1,
    };
    const response = await api
      .put(`/api/blogs/${blogs[0].id}`)
      .set("Authorization", token)
      .send(blogToUpdate)
      .expect(200);

    assert.deepStrictEqual(response.body, {
      title: "test blog 1",
      author: "test author",
      url: "somewhere",
      likes: 1,
      user: {
        username: "testuser",
        name: "test",
        id: response.body.user.id,
      },
      id: response.body.id,
    });
    assert.strictEqual(response.body.id, blogs[0].id);
  });

  test("blog cannot be updated without token", async () => {
    const blogs = await helper.blogsInDb();
    const blogToUpdate = {
      ...blogs[0],
      likes: 1,
    };
    const response = await api
      .put(`/api/blogs/${blogs[0].id}`)
      .send(blogToUpdate)
      .expect(401);

    assert.deepStrictEqual(response.body, {
      error: "token missing or expired",
    });
  });

  test("blog cannot be updated by another user", async () => {
    const blogs = await helper.blogsInDb();
    const anotherUser = helper.initialUsers[1];
    const loginResponse = await api.post("/api/login").send({
      username: anotherUser.username,
      password: anotherUser.password,
    });
    const blogToUpdate = {
      ...blogs[0],
      likes: 1,
    };
    const response = await api
      .put(`/api/blogs/${blogs[0].id}`)
      .set({ authorization: "Bearer " + loginResponse.body.token })
      .send(blogToUpdate)
      .expect(401);

    assert.deepStrictEqual(response.body, {
      error: "cannot update blog posted by other user",
    });
  });
});

after(async () => {
  await mongoose.connection.close();
});
