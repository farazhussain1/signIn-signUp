const e = require('express');
const jwt = require('jsonwebtoken')

const userModel = require('../models/user')

const SECRET_KEY = "notesAPI"

const auth = async (req, res, next) => {
    try {
        // TOKEN RETRACTED FROM THE HEADER
        let token = req.headers.authorization;
        if (token) {
            // TOKEN SPLITED FROM BEARER
            token = token.split(" ")[1]
            // TOKEN VERIFICATION AND STORING USER DETAILS IN USER variable
            let user = jwt.verify(token, SECRET_KEY)
            console.log(user.id);
            // Sending user id back
            req.userId = user.id
            // TO VERIFY THAT USER HAS LOGOUT OR IS STILL LOGIN
            // find user in token in the database to verify token
            const existingUser = await userModel.findOne({ email: user.email })
            if (!existingUser) {
                return res.status(404).json({ message: "user didn't exists" });
            }
            // store all the tokens of the user to check with the present token in the header
            const existingTokens = existingUser.tokens
            console.log(existingTokens)
            // check USER TOKENS with the present token in the header
            const check = existingUser.tokens.filter(t => {
                if (t.token == token) {
                    console.log(t);
                    return t;
                }
            })
            console.log("check \n", check)
            // If token doesn't match it means token is expired user logout
            if (check.length == 0) {
                return res.status(404).json({ message: "token expired!! User is no more logIn" });
            }
        }
        else {
            res.status(204).json({ message: "Empty! No Token found in header" });
        }
        next();
    } catch (error) {
        console.log("error is here")
        console.log(error)
        res.status(401).json({ message: "Unauthorize Users" });
    }
}

module.exports = { auth };

// const auth = (req,res,next)=>{
//     if(!req.query.age){
//         res.send("PLZ ENTER YOUR AGE")
//     }
//     else if(!req.query.age){
//         res.send("YOU ARE UNDER AGE")
//     }
//     else{
//         next()
//     }
// }
