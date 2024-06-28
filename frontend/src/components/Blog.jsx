import { useState } from "react";
import PropTypes from "prop-types";
import blogService from "../services/blogs";
import BlogDetails from "./BlogDetails";

const Blog = ({ blog, userId, onDelete }) => {
  const [viewAll, setViewAll] = useState(false);
  const buttonText = viewAll ? "hide" : "view";
  const [blogState, setBlogState] = useState(blog);

  const handleLike = async () => {
    const response = await blogService.likeBlog(blogState.id);
    setBlogState(response);
  };
  if (!viewAll) {
    return (
      <div className="blog-item">
        {blogState.title} {blogState.author}
        <button onClick={() => setViewAll(!viewAll)}>{buttonText}</button>
        <br />
      </div>
    );
  }

  return (
    <div className="blog-item">
      {blogState.title} {blogState.author}
      <button onClick={() => setViewAll(!viewAll)}>{buttonText}</button> <br />
      <BlogDetails blog={blogState} onLike={handleLike}></BlogDetails>
      {viewAll && userId === blogState.user.id && (
        <button onClick={() => onDelete(blogState)}>remove</button>
      )}
    </div>
  );
};

Blog.propTypes = {
  blog: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default Blog;
