const express = require('express');
const postsRouter = require('./posts');
const apiRouter = express.Router();
const usersRouter = require('./users');

apiRouter.use('/users', usersRouter);
apiRouter.use('/posts', postsRouter);


module.exports = apiRouter;

