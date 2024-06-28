const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const loginRouter = require("express").Router();
const User = require("../models/user");

loginRouter.post("/", async (request, response) => {
  const { username, password } = request.body;
  const user = await User.findOne({ username: username });
  const passwordOK = await bcrypt.compare(password, user?.password);
  if (user && passwordOK) {
    const userForToken = {
      username: user.username,
      id: user._id,
    };
    const options = {
      expiresIn: 300,
    };
    const token = jwt.sign(userForToken, process.env.TOKEN_PASSWORD, options);
    return response.status(200).send({ token, user: user.name, id: user._id });
  }

  return response.status(401).json({
    error: "invalid username or password",
  });
});

module.exports = loginRouter;
