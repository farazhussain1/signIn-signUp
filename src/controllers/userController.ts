import bcrypt from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import JOI from "joi";
import { Document, isValidObjectId, Mongoose } from "mongoose";
import { v4 } from "uuid"
import { transport } from "../mail/mail.config";
import { USER } from "../models/user";
import { Request, Response } from "express";

const SECRET_KEY = "notesAPI";

interface ForgetPassword {
  [key: string]: {
    email: string,
    timestamp: number
  }
}


export class UsersController {
  protected forgetPasswordData: ForgetPassword={};
  constructor() {
  }
  

  /**
   * @description Registers the new user and checks weather id is already in use or not
   */
  async signUp(req: Request, res: Response): Promise<Response<any, Record<string, any>>> {

    const validation = JOI.object().keys({
      username: JOI.string().required().min(3),
      email: JOI.string().required().email(),
      password: JOI.string().required().min(8),
    }).validate(req.body, { abortEarly: true });

    if (validation.error) {
      return res.status(400).json({ errors: validation.error.details });
    }

    try {
      const { username, password, email } = req.body;

      const existingUser = await USER.findOne({ email: email });
      if (existingUser) {
        return res.status(400).json({ message: "user already exists" });
      }

      const hashPassword = bcrypt.hashSync(password, 10);
      const userObj:any = await USER.create({
        email: email,
        password: hashPassword,
        username: username,
      });
      console.log(userObj._doc);

      const user = { ...userObj._doc };
      delete user.password;

      const info = await transport.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: user.email,
        subject: "Verification ✔", // Subject line
        html: `<a href="http://localhost:5000/api/users/verify/${user._id}">Click here to verify</a>`, // html body
      });

      if (info.rejected.includes(user.email)) {
        userObj.remove()
        return res.status(400).json({ message: "kindly check you provided valid email or not" });
      }

      return res.status(200).json({
        message: `Your account has been created successfully! \n Verification email sent to <b> ${user.email} </b>`,
        user,
      });
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong" });
    }
  }

  /**
   * @description User authentication check and login
   */
  async signIn(req: Request, res: Response) {
    const { email, password } = req.body;
    console.log(req.body);

    try {
      //FINDING USER AND SENDING RESPONSE IF NOT AVAILABLE
      const user:any = await USER.findOne({ email: email });
      if (!user) {
        return res.status(400).json({ message: "Invalid Email/Password" });
      }

      // CHECK WEATHER USER HAS VERFIED HIS EMAIL OR NOT
      if (!user.isVerified) {
        return res.status(404).json({
          message:
            "Email not verified !! You haven't verified your email plz do that first",
        });
      }

      //CHECKING PASSWORD WITH THE MATCHED EXISTING_USER PASSWORD AND SENDING RESPONSE IF NOT AVAILABLE
      const matchPassword = bcrypt.compareSync(password, user.password);
      console.log(matchPassword);
      if (!matchPassword) {
        return res.status(400).json({ message: "Invalid Email/Password" });
      }

      //TOKEN GENERATED
      const token = sign({ email: user.email, id: user._id }, SECRET_KEY, {
        expiresIn: "24h",
      });

      const userObj = { ...user._doc };
      delete userObj.password;

      res.cookie("authorization", token, {
        // httpOnly: true,
        // secure: true,
        // sameSite: "strict",
      });
      return res.status(200).json({
        message: "Successfuly Login ",
        token: token,
        user: userObj,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }

  /**
   * @description Sign out process with user authentication check
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @returns
   */
  async signOut(req: Request, res: Response) {
    try {
      // Taking token from the cookie
      let token = req.cookies.authorization;
      console.log(token);

      // Expiring the token in the cookie
      res.cookie("authorization", "null", { maxAge: 1 });
      res.status(200).json({ message: "Logout Successfully" });
    } catch (err) {
      console.log(err);
      res.status(400).json({ message: "something happened" });
    }
  }

  /**
   * @description Verifies the Email provided at the time of signUp. Also checks the mongoID/UserId provided is valid or not
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @returns
   */
  async verifyEmail(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const isValidMongoId = isValidObjectId(id);

      if (isValidMongoId) {
        //FINDING USER AND UPDATING EMAIL VERIFICATION FIELD
        const user = await USER.findByIdAndUpdate(
          id,
          { isVerified: true },
          {
            new: true,
          }
        );

        // IF USER DOESN'T EXISTS IT RETURNS
        if (!user) {
          return res.status(404).json({ message: "user didn't exists" });
        }
        return res
          .status(200)
          .send("<h1>Success you are verified user now</h1>");
      }
      return res.status(400).json({ message: "inValid Mongo ID" });
    } catch (err) {
      return res.status(500).json({ message: "something went wrong" });
    }
  }

  /**
   * @description Verifies the Email provided at the time of signUp. Also checks the mongoID/UserId provided is valid or not
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @returns
   */
  async forgotPassword(req: Request, res: Response) {
    const validator = JOI.object()
      .keys({
        email: JOI.string().required().email(),
      })
      .validate(req.body);

    if (validator.error) {
      return res.status(400).json({ errors: validator.error.details });
    }

    const email = req.body.email;
    const user = await USER.exists({ email: email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Email" });
    }
    try {
      const uuid = v4();
      this.forgetPasswordData[uuid] = {
        email: email,
        timestamp: Date.now(),
      };

      //TOKEN GENERATED
      const token = sign({ uuid }, SECRET_KEY, {
        expiresIn: "120s",
      });

      console.log(token);

      let info = await transport.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: email,
        subject: "Change Password ✔", // Subject line
        // html: `<a href="http://localhost:5000/users/changePassword/${token}">Click here to change your password</a>`, // html body
        html: `<a href="http://localhost:3000/change-password/${token}">Click here to change your password</a>`,
      });

      console.log(info.accepted);

      // IF EMAIL IS NOT SENT THEN DELETE BACK THE USER ADDED IN DATABASE AND SENDS THE RESPONSE
      if (info.rejected.includes(email)) {
        return res.status(400).json({ message: "Invalid Email" });
      }

      res.cookie("authorization", token);
      res.status(201).json({
        message: "Email sent !! kindly check inbox for password change",
        token: token,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  /**
   * @description Verifies the Token. Changes the password in the database
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @returns
   */
  async changePassword(req: Request, res: Response) {
    const token = req.params.token;

    const validator = JOI.object().keys({
      password: JOI.string().required().min(8),
    }).validate(req.body);

    if (validator.error) {
      return res.status(400).json({ err: validator.error.message });
    }
    try {
      const { password } = req.body;
      let uuid = "";
      verify(token, SECRET_KEY, (err, payload: any) => {
        if (err)
          res.status(400).json({ message: "link is expired, try again!" });
        uuid = payload.uuid;
      });

      const data = this.forgetPasswordData[uuid];
      if (!data) {
        return res.status(400).json({ message: "link is expired, try again!" });
      }

      const hashPassword = bcrypt.hashSync(password, 10);

      const user = await USER.updateOne(
        { email: data.email },
        { $set: { password: hashPassword } }
      );

      if (!user.modifiedCount) {
        return res
          .status(400)
          .json({ message: "password could not be updated" });
      }

      return res.status(200).json({ message: "Password Updated successfully" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
