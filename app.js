const config = require("./utils/config");
const express = require("express");
require("express-async-errors");
const process = require("process");
const app = express();
const cors = require("cors");
const blogRouter = require("./controllers/blogs");
const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");
const middleware = require("./utils/middleware");
const logger = require("./utils/logger");
const mongoose = require("mongoose");

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .catch((error) => {
    logger.error("error connection to MongoDB:", error.message);
  });

app.use(cors());
app.use(express.static("frontend/dist"));
app.use(express.json());
app.use(middleware.requestLogger);
app.get("/health", (req, res) => {
  res.status(200).send();
});
app.use("/api/login", loginRouter);
app.use(middleware.tokenExtractor);
app.use("/api/users", usersRouter);
app.use("/api/blogs", middleware.userExtractor, blogRouter);
if (process.env.NODE_ENV === "test") {
  const testingRouter = require("./controllers/testing");
  app.use("/api/testing", testingRouter);
}
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
