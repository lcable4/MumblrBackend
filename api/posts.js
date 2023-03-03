const express = require('express');
const { getAllPosts } = require('../db');
const postsRouter = express.Router();
const { requireUser } = require('./utils');
const { createPost } = require('../db');

postsRouter.use((req, res, next) => {
    console.log("A request is being made to /posts");
  
    next();
  });
  
  postsRouter.get('/', async (req, res) => {
      const posts = await getAllPosts();
  
      res.send({
          posts
      });
  });

  postsRouter.post('/', requireUser, async (req, res, next) => {
    const { title, content, tags = "" } = req.body;
    
    const tagArr = tags.trim().split(/\s+/);
    const postData = {
        authorId: req.user.id,
        title,
        content,
        tags: tagArr,
    };
    
    try {
    const post = await createPost(postData);
    if (post) {
        res.send({ post });
        } else {
        next({ name: 'PostCreationError', message: 'Error creating post.' });
        }
        } catch ({ name, message }) {
        next({ name, message });
    }
    });

module.exports = postsRouter;