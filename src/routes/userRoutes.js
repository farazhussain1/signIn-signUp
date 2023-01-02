const express = require('express');
//const auth = require('../middlewares/auth');
const { signUp, signIn, signOut } = require('../controllers/userController');
const userRouter = express.Router();

userRouter.post("/signup", signUp);

userRouter.post("/signin", signIn);

userRouter.post("/signout", signOut);

module.exports = userRouter;