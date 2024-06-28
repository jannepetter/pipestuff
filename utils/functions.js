const jwt = require("jsonwebtoken");

const authentication = (token) => {
  if (token === null) {
    return null;
  }
  try {
    const decodedToken = jwt.verify(token, process.env.TOKEN_PASSWORD);
    return decodedToken;
  } catch (error) {
    console.log("authentication error in functions authentication");
    return null;
  }
};

module.exports = {
  authentication,
};
