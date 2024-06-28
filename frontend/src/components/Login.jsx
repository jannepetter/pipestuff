import { useState } from "react";
import PropTypes from "prop-types";
import blogService from "../services/blogs";
import localstorage from "../utils/localstorage";

const Login = ({ setUser, onError }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await blogService.login({
        username,
        password,
      });
      localstorage.saveUser(response.token, response.user, response.id);
      setUser({
        name: response.user,
        id: response.id,
      });
      setPassword("");
      setUsername("");
    } catch (error) {
      console.log("error with login", error.response.data);
      onError(error.response.data.error);
    }
  };
  return (
    <>
      <form onSubmit={onSubmit}>
        <div>
          username:
          <input
            data-testid="login-username"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />
        </div>
        <div>
          password:
          <input
            data-testid="login-password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>
        <div>
          <button data-testid="login-submit-btn" type="submit">
            login
          </button>
        </div>
      </form>
    </>
  );
};

Login.propTypes = {
  setUser: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default Login;
