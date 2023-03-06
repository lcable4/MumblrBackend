const express = require("express");
const { getAllTags, getPostsByTagName, getAllPosts } = require("../db");
const tagsRouter = express.Router();

tagsRouter.use((req, res, next) => {
  console.log("A request is being made to /tags");

  next();
});

tagsRouter.get("/", async (req, res) => {
  const tags = await getAllTags();

  res.send({
    tags,
  });
});

tagsRouter.get("/:tagName/posts", async (req, res, next) => {
  // read the tagname from the params
  let { tagName } = req.params;
  try {
    const tags = await getPostsByTagName(tagName);
    const allPosts = await getAllPosts();
    console.log(tags);
    const posts = allPosts.filter((post) => {
      // the post is active, doesn't matter who it belongs to
      if (post.active) {
        return true;
      }

      // the post is not active, but it belongs to the current user
      if (req.user && post.author.id != req.user.id) {
        return true;
      }

      // none of the above are true
      return false;
    });
    res.send({
      tags,
      posts,
    });
    // use our method to get posts by tag name from the db
    // send out an object to the client { posts: // the posts }
  } catch ({ name, message }) {
    // forward the name and message to the error handler
    next({ name, message });
  }
});

module.exports = tagsRouter;
