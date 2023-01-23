import express from 'express';
import {UsersController} from '../controllers/userController';
import { auth } from '../middlewares/auth';

export const userRouter = express.Router();

const user = new UsersController()

userRouter.post("/signup", user.signUp);

userRouter.post("/signin", user.signIn);

userRouter.post("/signout", auth, user.signOut);

userRouter.get("/verify/:id", user.verifyEmail );

userRouter.post("/forgotPassword", user.forgotPassword.bind(UsersController) );

userRouter.post("/changePassword/:token", user.changePassword.bind(UsersController) );

