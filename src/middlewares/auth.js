const jwt = require("jsonwebtoken");

const SECRET_KEY = "notesAPI";

/**
 * @description User is authenticated each times he performs and operation with notes or wants to signOut from the system
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns
 */
const auth = async (req, res, next) => {
  try {
    let token = req.cookies.authorization;
    if (!token) {
      return res.status(403).json({message:"Unauthenticated!"})
    }
    let user = jwt.verify(token, SECRET_KEY);
    req.userId = user.id;
    next();
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

module.exports = { auth };
