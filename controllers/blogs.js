const blogsRouter = require("express").Router();
const Blog = require("../models/blog");

blogsRouter.get("/", async (request, response) => {
  const result = await Blog.find({}).populate("user");
  response.json(result);
});

blogsRouter.get("/:id", async (request, response) => {
  const blogId = request.params.id;
  const result = await Blog.findById(blogId).populate("user");
  response.json(result);
});

blogsRouter.post("/", async (request, response) => {
  const blog = new Blog({
    likes: request.body.likes || 0,
    user: request.user._id.toString(),
    ...request.body,
  });

  const newBlog = await blog.save();
  const result = await Blog.findById(newBlog._id).populate("user");
  response.status(201).json(result);
});

blogsRouter.delete("/:id", async (request, response) => {
  const blogId = request.params.id;
  const blog = await Blog.findById(blogId);
  if (blog.user._id.toString() !== request.user._id.toString()) {
    response
      .status(401)
      .send({ error: "cannot delete blog posted by other user" });
  }
  await blog.deleteOne();
  response.status(204).end();
});

blogsRouter.put("/:id", async (request, response) => {
  const blogId = request.params.id;
  const blog = await Blog.findById(blogId);
  if (blog.user.toString() !== request.user._id.toString()) {
    response
      .status(401)
      .send({ error: "cannot update blog posted by other user" });
  }
  const body = request.body;
  const result = await Blog.findByIdAndUpdate(blogId, body, {
    new: true,
  }).populate("user");
  response.status(200).json(result);
});

blogsRouter.put("/:id/like", async (request, response) => {
  // separate endpoint because only owner can update the entire blog.
  // Everyone is able to like
  const blogId = request.params.id;
  const blog = await Blog.findById(blogId);
  blog.likes = blog.likes + 1;
  const newBlog = await blog.save();
  const result = await Blog.findById(newBlog._id).populate("user");
  response.status(200).json(result);
});

module.exports = blogsRouter;
