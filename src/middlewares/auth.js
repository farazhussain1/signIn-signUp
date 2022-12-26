const e = require('express');
const jwt = require('jsonwebtoken')
const SECRET_KEY= "notesAPI"

const auth = (req,res,next)=>{
    try {
        let token = req.headers.autherization;
        if(token){
            token = token.split(" ")[1]
            let user = jwt.verify(token,SECRET_KEY)
            req.userId = user.id
        }
        else{
            res.status(401).json({message : "Unauthorize User"});
        }
        next();
    } catch (error) {
        console.log(error)
        res.status(401).json({message : "Unauthorize User"});
    }
}

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

// module.exports = auth;