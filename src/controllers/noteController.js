const userModel = require("../models/note");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const SECRET_KEY= "notesAPI"

const createNote = async (req,res)=>{
    const {title,description,userId} = req.body;

    try{
        const exi = await userModel.findOne({email : email})
        const existingUser = await userModel.findOne({email : email})
        if(existingUser){
            return res.status(404).json({message:"user already exists"});
        }

        const hashPassword = await bcrypt.hash(password,10);

        const result  = await userModel.create({
            email: email,
            password: hashPassword,
            username: username
        });

        const token = jwt.sign({email: result.email,id: result._id}, SECRET_KEY);
        res.status(201).json({user:result,token: token});

    }catch(error){
        console.log(error);
        res.status(500).json({message: "Something went wrong"})
    }
}

const updateNote = (req,res)=>{
    
}

const deleteNote = (req,res)=>{
    
}

const getNote = (req,res)=>{
    
}

const signUp = async (req,res)=>{

    ///Check Weather user is existing or not
    // Hash password
    // User Creation
    // token generation

    const {username,password,email}=req.body;

    try{
        const existingUser = await userModel.findOne({email : email})
        if(existingUser){
            return res.status(404).json({message:"user already exists"});
        }

        const hashPassword = await bcrypt.hash(password,10);

        const result  = await userModel.create({
            email: email,
            password: hashPassword,
            username: username
        });

        const token = jwt.sign({email: result.email,id: result._id}, SECRET_KEY);
        res.status(201).json({user:result,token: token});

    }catch(error){
        console.log(error);
        res.status(500).json({message: "Something went wrong"})
    }
}

const signIn = async (req,res)=>{
    
    const {email,password}=req.body;

    try{
        const existingUser = await userModel.findOne({email : email})
        if(!existingUser){
            return res.status(404).json({message:"user didn't exists"});
        }

        // const hashPassword = await bcrypt.hash(password,10);
        const matchPassword = await bcrypt.compare(password,existingUser.password);

        if(!matchPassword){
            return res.status(400).json({message:"Invalid Password"});
        }

        const token = jwt.sign({email: existingUser.email,id: existingUser._id}, SECRET_KEY);
        res.status(201).json({user:existingUser,token: token});

    }catch(error){
        console.log(error);
        res.status(500).json({message: "Something went wrong"})
    }
    
}

module.exports = {signIn,signUp}