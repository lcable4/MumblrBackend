const express = require("express");
const usersRouter = express.Router();
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const {
  getAllUsers,
  getUserByUsername,
  createUser,
  updateUser,
} = require("../db");

usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next();
});

usersRouter.get("/", async (req, res) => {
  const users = await getAllUsers();

  res.send({
    users,
  });
});

usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password",
    });
  }

  try {
    const user = await getUserByUsername(username);

    if (user && user.password == password) {
      const token = jwt.sign(
        {
          id: user.id,
          username,
        },
        process.env.JWT_SECRET
      );
      res.send({ message: "You are logged in!", token });
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or Password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.post("/register", async (req, res, next) => {
  const { username, password, name, location } = req.body;

  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      next({
        name: "UserExistsError",
        message: "A user by that username already exists",
      });
    }

    const user = await createUser({
      username,
      password,
      name,
      location,
    });

    const token = jwt.sign(
      {
        id: user.id,
        username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1w",
      }
    );

    res.send({
      message: "thank you for signing up",
      token,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

usersRouter.delete("/:userId", async (req, res, next) => {
  try {
    const userToDelete = await getUserById(req.params.userId);

    if (!userToDelete || !userToDelete.active) {
      return next({
        name: "UserNotFoundError",
        message: "That user does not exist or is not active",
      });
    }

    if (userToDelete.id !== req.user.id) {
      return next({
        name: "UnauthorizedUserError",
        message: "You cannot delete another user's account",
      });
    }

    const updatedUser = await updateUser(userToDelete.id, { active: false });

    res.send({ user: updatedUser });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = usersRouter;
