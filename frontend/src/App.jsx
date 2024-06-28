import { useState, useEffect } from "react";
import Blog from "./components/Blog";
import Login from "./components/Login";
import blogService from "./services/blogs";
import localstorage from "./utils/localstorage";
import NewBlog from "./components/NewBlog";
import Notification from "./components/Notification";
import Togglable from "./components/Togglable";

const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [user, setUser] = useState(localstorage.readUserName() || null);
  const [notificationMsg, setNotificationMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const MSGTIME = 3000;
  const blogsToShow = blogs.sort((a, b) => b.likes - a.likes);

  useEffect(() => {
    blogService
      .getAll()
      .then((blogs) => setBlogs(blogs))
      .catch((e) => {
        console.log("error", e);
        if (e?.response?.data?.error === "token missing or expired") {
          setUser(null);
          localstorage.clearStorage();
        }
      });
  }, [user]);
  console.log(blogs, user);

  const handleLogout = () => {
    localstorage.clearStorage();
    setUser(null);
    setBlogs([]);
  };

  const handleBlogSubmit = async (data) => {
    const response = await blogService.postBlog(data);
    setBlogs(blogs.concat(response));
    return response;
  };

  const handleNotificationMsg = (msg) => {
    setNotificationMsg(msg);
    setTimeout(() => {
      setNotificationMsg(null);
    }, MSGTIME);
  };

  const handleErrorMsg = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => {
      setErrorMsg(null);
    }, MSGTIME);
  };

  const handleDelete = async (blogToDelete) => {
    const confirm = window.confirm(
      `Remove blog ${blogToDelete.title} by ${blogToDelete.author}`
    );
    if (confirm) {
      await blogService.deleteBlog(blogToDelete.id);
      const newBlogs = blogs.filter((b) => b.id !== blogToDelete.id);
      setBlogs([...newBlogs]);
    }
  };

  if (!user) {
    return (
      <div>
        <h1>Log in to application</h1>
        <Notification
          message={notificationMsg}
          errorMsg={errorMsg}
        ></Notification>
        <Login onError={handleErrorMsg} setUser={setUser}></Login>
      </div>
    );
  }
  return (
    <div>
      <h1>blogs</h1>
      <Notification
        message={notificationMsg}
        errorMsg={errorMsg}
      ></Notification>
      <div>
        <span>{user.name} logged in</span>
        <button data-testid="logout-button" onClick={handleLogout}>
          logout
        </button>
      </div>
      <br></br>
      <Togglable buttonLabel="new blog">
        <NewBlog
          onSubmit={handleBlogSubmit}
          onError={handleErrorMsg}
          onSuccess={handleNotificationMsg}
        ></NewBlog>
      </Togglable>
      {blogsToShow.map((blog) => (
        <Blog
          key={blog.id}
          blog={blog}
          userId={user.id}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};

export default App;
