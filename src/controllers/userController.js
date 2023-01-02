const userModel = require("./../models/user");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const SECRET_KEY = "notesAPI"


const signUp = async (req, res) => {

    ///Check Weather user is existing or not
    // Hash password
    // User Creation
    // token generation

    const { username, password, email } = req.body;

    try {
        const existingUser = await userModel.findOne({ email: email })
        if (existingUser) {
            return res.status(403).json({ message: "user already exists" });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const result = await userModel.create({
            email: email,
            password: hashPassword,
            username: username
        });

        const token = jwt.sign({ email: result.email, id: result._id }, SECRET_KEY, {expiresIn: '600s'});
        return res.status(200).json({ user: result, token: token });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" })
    }
}

const signIn = async (req, res) => {

    const { email, password } = req.body;

    try {
        //FINDING USER AND SENDING RESPONSE IF NOT AVAILABLE
        const existingUser = await userModel.findOne({ email: email })
        if (!existingUser) {
            return res.status(404).json({ message: "user didn't exists" });
        }

        //CHECKING PASSWORD WITH THE EXISTING_USER AND SENDING RESPONSE IF NOT AVAILABLE
        const matchPassword = await bcrypt.compare(password, existingUser.password);
        if (!matchPassword) {
            return res.status(400).json({ message: "Invalid Password" });
        }

        const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, SECRET_KEY, {expiresIn: '600s'});
        res.status(201).json({ message: "Successfuly Login " , user: existingUser, token: token });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" })
    }

}


const signOut = async (req, res) => {

    try {
        let token = req.headers.authorization
        token = token.split(" ")[1]
        const existingUser = await userModel.findOne({ username: req.user.username })
        if (!existingUser) {
            return res.status(404).json({ message: "user didn't exists" });
        }
        const oldTokens = existingUser.tokens
        const newTokens = oldTokens.filter(t=>t.token!=token)

        await userModel.findByIdAndUpdate(existingUser._id,{tokens:newTokens})
    
        console.log(newTokens)
        res.status(200).json({message: "Logout Successfully"})
        
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: 'something happened' })
    }
}

module.exports = { signUp, signIn, signOut }