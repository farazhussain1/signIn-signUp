const jwt = require('jsonwebtoken')

const SECRET_KEY =  "notesAPI"

/**
 * @description User is authenticated each times he performs and operation with notes or wants to signOut from the system
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 * @returns 
 */
const auth = async (req, res, next) => {
    try {
        // TOKEN RETRACTED FROM COOKIES
        let token = req.cookies.authorization;
        if (token) {
            // TOKEN VERIFICATION AND STORING USER DETAILS IN USER variable
            let user = jwt.verify(token, SECRET_KEY)
            // Sending user id back
            req.userId = user.id
        }
        else {
            return res.status(204).json({ message: "Empty! No Token found in header" });
        }
        next();
    } catch (error) {
        console.log(error)
        res.status(401).json({ message: "Unauthorize Users" });
    }
}

module.exports = { auth };