const logger = require("./logger");
const User = require("../models/user");
const functions = require("../utils/functions");

const requestLogger = (request, response, next) => {
  if (!process.env.NODE_ENV === "test") {
    logger.info("Method:", request.method);
    logger.info("Path:  ", request.path);
    logger.info("Body:  ", request.body);
    logger.info("---");
  }
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (error, request, response, next) => {
  if (!process.env.NODE_ENV === "test") {
    logger.error(error.message);
  }

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

const getTokenFrom = (request) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    return authorization.replace("Bearer ", "");
  }
  return null;
};

const tokenExtractor = (request, response, next) => {
  const token = getTokenFrom(request);
  request.token = token;
  next();
};

const userExtractor = async (request, response, next) => {
  const token = getTokenFrom(request);
  const decodedToken = functions.authentication(token);
  if (decodedToken) {
    const user = await User.findById(decodedToken.id);
    request.user = user;
  } else {
    return response.status(401).send({ error: "token missing or expired" });
  }
  next();
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
};
