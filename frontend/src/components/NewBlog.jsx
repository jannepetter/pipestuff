import { useState } from "react";

const NewBlog = ({ onSubmit, onError, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [url, setUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        title,
        author,
        url,
      };
      const response = await onSubmit(data);
      onSuccess(`a new blog ${response.title} by ${response.author}`);
      setTitle("");
      setAuthor("");
      setUrl("");
    } catch (error) {
      console.log("error with blog creation", error);
      onError(error?.response?.data?.error);
    }
  };
  return (
    <>
      <h1>Create new</h1>
      <form onSubmit={handleSubmit}>
        <div>
          title:
          <input
            id="blog-title-input"
            data-testid="blog-title"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
          />
        </div>
        <div>
          author:
          <input
            id="blog-author-input"
            data-testid="blog-author"
            onChange={(e) => setAuthor(e.target.value)}
            value={author}
          />
        </div>
        <div>
          url:
          <input
            id="blog-url-input"
            data-testid="blog-url"
            onChange={(e) => setUrl(e.target.value)}
            value={url}
          />
        </div>
        <div>
          <button type="submit">create</button>
        </div>
      </form>
      <br></br>
    </>
  );
};

export default NewBlog;
