const express = require("express");
const postsRouter = require("./posts");
const apiRouter = express.Router();
const usersRouter = require("./users");
const tagsRouter = require("./tags");

apiRouter.use("/users", usersRouter);
apiRouter.use("/posts", postsRouter);
apiRouter.use("/tags", tagsRouter);

module.exports = apiRouter;
