const saveUser = (token, name, id) => {
  window.localStorage.setItem("user", token);
  window.localStorage.setItem("userName", name);
  window.localStorage.setItem("userId", id);
};

const readUser = () => {
  return window.localStorage.getItem("user");
};
const readUserName = () => {
  return window.localStorage.getItem("userName");
};
const readUserId = () => {
  return window.localStorage.getItem("userId");
};
const clearStorage = () => {
  window.localStorage.clear();
};

export default {
  saveUser,
  readUser,
  readUserName,
  clearStorage,
  readUserId,
};
