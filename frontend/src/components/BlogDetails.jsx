const BlogDetails = ({ blog, onLike }) => {
  return (
    <>
      <span>{blog.url}</span>
      <br />
      <span>likes {blog.likes}</span>
      <button onClick={() => onLike()}>like</button>
      <br />
      <span>{blog.user.name}</span>
      <br />
    </>
  );
};

export default BlogDetails;
