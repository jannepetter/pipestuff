import { render, screen, fireEvent } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import Blog from "../src/components/Blog";
import BlogDetails from "../src/components/BlogDetails";
import NewBlog from "../src/components/NewBlog";
import userEvent from "@testing-library/user-event";

const blog = {
  title: "A blog title",
  author: "some author",
  url: "www.somewhere.com",
  likes: 5,
  user: {
    name: "test user",
    id: "testid",
  },
};

test("renders directly visible content", () => {
  render(<Blog blog={blog} userId={blog.user.id} onDelete={() => {}} />);
  const condition = { exact: false };
  screen.getByText("A blog title", condition);
  screen.getByText("some author", condition);
  const urlElement = screen.queryByText("www.somewhere.com");
  expect(urlElement).toBeNull();
  const likesElement = screen.queryByText("www.somewhere.com", condition);
  expect(likesElement).toBeNull();
});

test("renders hidden content", async () => {
  render(<Blog blog={blog} userId={blog.user.id} onDelete={() => {}} />);

  const user = userEvent.setup();
  const button = screen.getByText("view");
  await user.click(button);
  const condition = { exact: false };

  screen.getByText("A blog title", condition);
  screen.getByText("some author", condition);
  screen.getByText("www.somewhere.com");
  screen.getByText("likes 5");
  screen.getByText("test user");
});

test("like button works", async () => {
  const mockHandler = vi.fn();
  render(<BlogDetails blog={blog} onLike={mockHandler} />);

  screen.getByText("www.somewhere.com");
  screen.getByText("likes 5");
  screen.getByText("test user");

  const user = userEvent.setup();
  const likeButton = screen.getByText("like");
  await user.click(likeButton);
  await user.click(likeButton);

  expect(mockHandler).toHaveBeenCalledTimes(2);
});

test("blogform works", async () => {
  const user = userEvent.setup();
  const mockHandler = vi.fn();

  const { container } = render(
    <NewBlog onSubmit={mockHandler} onError={() => {}} onSuccess={() => {}} />
  );

  const titleInput = container.querySelector("#blog-title-input");
  await user.type(titleInput, "test title");

  const authorInput = container.querySelector("#blog-author-input");
  await user.type(authorInput, "example author");

  const urlInput = container.querySelector("#blog-url-input");
  await user.type(urlInput, "someurl");
  const submitButton = screen.getByText("create");
  await user.click(submitButton);

  const handlerCall = mockHandler.mock.calls[0][0];
  expect(handlerCall.title).toBe("test title");
  expect(handlerCall.author).toBe("example author");
  expect(handlerCall.url).toBe("someurl");

  expect(mockHandler.mock.calls).toHaveLength(1);
});
