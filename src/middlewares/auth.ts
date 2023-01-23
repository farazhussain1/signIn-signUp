import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

const SECRET_KEY = "notesAPI";

/**
 * @description User is authenticated each times he performs and operation with notes or wants to signOut from the system
 * @returns
 */
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies.authorization;
    if (!token) {
      return res.status(403).json({message:"Unauthenticated!"})
    }
    let user:any = verify(token, SECRET_KEY);
    req['userId'] = user.id;
    next();
  } catch (error:any) {
    res.status(401).json({ message: error.message });
  }
};
