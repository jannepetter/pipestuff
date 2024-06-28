const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.get("/", async (request, response) => {
  // did not want to add data twice to blogs and to users when posting a new blog
  const result = await User.aggregate([
    {
      $lookup: {
        from: "blogs",
        localField: "_id",
        foreignField: "user",
        as: "blogs",
      },
    },
    {
      $project: {
        id: "$_id",
        username: 1,
        name: 1,
        blogs: {
          $map: {
            input: "$blogs",
            as: "blog",
            in: {
              url: "$$blog.url",
              title: "$$blog.title",
              author: "$$blog.author",
              id: "$$blog._id",
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]);
  response.json(result);
});

usersRouter.delete("/:id", async (request, response) => {
  const userId = request.params.id;
  await User.findByIdAndDelete(userId);
  response.status(204).end();
});

usersRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body;
  if (password.length < 3) {
    return response
      .status(400)
      .json({ error: "password needs to be at least 3 characters long" });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    password: passwordHash,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

module.exports = usersRouter;
