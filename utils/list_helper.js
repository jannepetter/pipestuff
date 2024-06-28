const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  const sum = blogs.reduce((acc, item) => {
    return acc + item.likes;
  }, 0);
  return sum;
};

const favoriteBlog = (blogs) => {
  const orderedBlogs = blogs.sort((a, b) => b.likes - a.likes);
  const mostLiked = orderedBlogs[0];
  return {
    title: mostLiked.title,
    author: mostLiked.author,
    likes: mostLiked.likes,
  };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};
