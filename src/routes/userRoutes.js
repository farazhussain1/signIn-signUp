const express = require('express');

const { signUp, signIn, signOut } = require('../controllers/userController');
const { auth } = require('../middlewares/auth');

const userRouter = express.Router();

userRouter.post("/signup", signUp);

userRouter.post("/signin", signIn);

userRouter.post("/signout", auth, signOut);

module.exports = userRouter;