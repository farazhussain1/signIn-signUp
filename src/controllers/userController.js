const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const joi = require("joi");
const { isValidObjectId } = require("mongoose");
const Uuid = require("uuid");

const userModel = require("./../models/user");
const { transport } = require("../mail/mail.config");

const SECRET_KEY = "notesAPI";

class UsersController {
  static forgetPasswordData = {};
  constructor() {
    this.forgetPasswordData;
  }

  /**
   * @description Registers the new user and checks weather id is already in use or not
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @returns
   */
  async signUp(req, res) {
    const validation = joi
      .object()
      .keys({
        username: joi.string().required().min(3),
        password: joi.string().required().min(8),
        email: joi.string().required().email(),
      })
      .validate(req.body);

    if (validation.error) {
      return res.status(400).json({ errors: validation.error.details });
    }

    const { username, password, email } = req.body;

    try {
      // FINDING USER AND SENDING RESPONSE IF ALREADY AVAILABLE
      const existingUser = await userModel.findOne({ email: email });
      if (existingUser) {
        return res.status(403).json({ message: "user already exists" });
      }

      // HASHING PASSWORD
      const hashPassword = await bcrypt.hash(password, 10);

      // STORING NEW USER IN DATABASE AND CREATING AN OBJECT
      const userObj = await userModel.create({
        email: email,
        password: hashPassword,
        username: username,
      });

      // USER PASSWORD IS CLEARED FROM NEW USEROBJ
      const user = { ...userObj._doc };
      delete user.password;

      // send mail with defined transport object
      let info = await transport.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: user.email,
        subject: "Verification ✔", // Subject line
        html: `<a href="http://localhost:5000/users/verify/${user._id}">Click here to verify</a>`, // html body
      });

      // IF EMAIL IS NOT SENT THEN DELETE BACK THE USER ADDED IN DATABASE AND SENDS THE RESPONSE
      if (info.rejected.includes(user.email)) {
        const deleteUser = await userModel.findByIdAndRemove(user._id);
        if (!deleteUser) {
          console.log("Was not able to delete back user");
        }
        return res
          .status(400)
          .json({ message: "kindly check you provided valid email or not" });
      }

      return res.status(200).json({
        message: `New User Created! email send to ${user.email}`,
        user,
      });
    } catch (error) {
      // PRINTING ERROR MESSAGE
      console.log(error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  }

  /**
   * @description User authentication check and login
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @returns
   */
  async signIn(req, res) {
    const { email, password } = req.body;

    try {
      //FINDING USER AND SENDING RESPONSE IF NOT AVAILABLE
      const user = await userModel.findOne({ email: email });
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
      const matchPassword = await bcrypt.compare(password, user.password);
      console.log(matchPassword);
      if (!matchPassword) {
        return res.status(400).json({ message: "Invalid Email/Password" });
      }

      //TOKEN GENERATED
      const token = jwt.sign({ email: user.email, id: user._id }, SECRET_KEY, {
        expiresIn: "24h",
      });

      const userObj = { ...user._doc };
      delete userObj.password;

      res.cookie("authorization", token);
      res.status(201).json({
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
  async signOut(req, res) {
    try {
      // Taking token from the cookie
      let token = req.cookies.authorization;
      console.log(token);

      // Expiring the token in the cookie
      res.cookie("authorization", "null", { expiresIn: Date.now() });
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
  async verifyEmail(req, res) {
    const id = req.params.id;
    try {
      const isValidMongoId = isValidObjectId(id);

      if (isValidMongoId) {
        //FINDING USER AND UPDATING EMAIL VERIFICATION FIELD
        const user = await userModel.findByIdAndUpdate(
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
  async forgotPassword(req, res) {
    const validator = joi
      .object()
      .keys({
        email: joi.string().required().email(),
      })
      .validate(req.body);

    if (validator.error) {
      return res.status(400).json({ errors: validator.error.details });
    }

    const email = req.body.email;
    const user = await userModel.exists({ email: email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Email" });
    }
    try {
      const uuid = Uuid.v4();
      this.forgetPasswordData[uuid] = {
        email: email,
        timestamp: Date.now(),
      };

      //TOKEN GENERATED
      const token = jwt.sign({ uuid }, SECRET_KEY, {
        expiresIn: "120s",
      });

      console.log(token);

      let info = await transport.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: email,
        subject: "Change Password ✔", // Subject line
        html: `<a href="http://localhost:5000/users/changePassword/${token}">Click here to change your password</a>`, // html body
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
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  async changePassword(req, res) {
    const token = req.params.token;

    const validator = joi
      .object()
      .keys({
        password: joi.string().required().min(8),
      })
      .validate(req.body);

    if (validator.error) {
      return res.status(400).json({ err: validator.error.message });
    }
    try {
      const { password } = req.body;
      let uuid = null;
      jwt.verify(token, SECRET_KEY, (err, payload) => {
        if (err)
          res.status(400).json({ message: "link is expired, try again!" });
        uuid = payload.uuid;
      });

      const data = this.forgetPasswordData[uuid];

      if(!data){
        return res.status(400).json({message:"link is expired, try again!"})
      }

      const hashPassword = await bcrypt.hash(password,10);

      const user = await userModel.updateOne({email: data.email},{$set:{password:hashPassword}});

      if(!user.modifiedCount){
        return res.status(400).json({message: "password could not be updated"})
      }

      return res.status(200).json({message: "Password Updated successfully"})
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
}

module.exports = UsersController;
