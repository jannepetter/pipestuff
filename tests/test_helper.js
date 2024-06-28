const Blog = require("../models/blog");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const initialBlogs = [
  {
    title: "test blog 1",
    author: "test author",
    url: "somewhere",
    likes: 0,
  },
  {
    title: "test blog 2",
    author: "another author",
    url: "theurlhere",
    likes: 0,
  },
];

const initialUsers = [
  {
    username: "testuser",
    password: "testpass",
    name: "test",
  },
  {
    username: "someuser",
    password: "somepass",
    name: "someuser",
  },
];

const nonExistingId = async () => {
  const blog = new Blog({
    title: "temp",
    author: "temp",
    url: "temp",
    likes: 0,
  });
  await blog.save();
  await blog.deleteOne();

  return blog.id;
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((b) => b.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({}, "-password");
  return users.map((user) => user.toJSON());
};

const createUsers = async (userList) => {
  let userObjList = [];
  for (const user of userList) {
    const newUser = {
      name: user.name,
      username: user.username,
      password: await bcrypt.hash(user.password, 10),
    };
    userObjList.push(newUser);
  }
  const newUserList = await User.insertMany(userObjList);
  return newUserList;
};

const initDB = async () => {
  await User.deleteMany({});
  await createUsers(initialUsers);
  const blogUser = await User.findOne({ username: "testuser" }).exec();
  const blogs = [];
  for (const b of initialBlogs) {
    b.user = blogUser._id;
    blogs.push(b);
  }
  await Blog.deleteMany({});
  await Blog.insertMany(blogs);
  return initialUsers;
};

module.exports = {
  initialBlogs,
  initialUsers,
  createUsers,
  nonExistingId,
  blogsInDb,
  usersInDb,
  initDB,
};
