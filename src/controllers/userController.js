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

        //TOKEN GENERATED
        const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, SECRET_KEY, {expiresIn: '600s'});
        const newtoken = "Bearer " + token;

        let oldTokens = existingUser.tokens || []

        if (oldTokens) {
            oldTokens = oldTokens.filter(t => {
                const timediff = (Date.now() - parseInt(t.signedAt)) / 1000;
                console.log(timediff)
                if (timediff < 600) {
                    return t;
                }
            })
        }
        await userModel.findByIdAndUpdate(existingUser._id, { tokens: [...oldTokens, { token, signedAt: Date.now().toString() }], })
    
        console.log(newtoken)
        // return res.status(200).json({ message: "Successfuly Login " + newtoken });

        res.status(201).json({ message: "Successfuly Login " , newtoken: newtoken , user: existingUser });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" })
    }
}

const signOut = async (req, res) => {
    try {
        //TOKEN THAT WILL BE REMPVED
        let token = req.headers.authorization
        token = token.split(" ")[1]

        // Getting user details to logout
        const existingUser = await userModel.findOne({ _id: req.userId })
        if (!existingUser) {
            return res.status(404).json({ message: "user didn't exists" });
        }
        // Storing all the available tokens
        const oldTokens = existingUser.tokens
        // filtering oldtokens 
        // Taking out the matching token out of it 
        // And storing rest
        const newTokens = oldTokens.filter(t => t.token != token)

        // Updating tokens without the current token through which it's login
        await userModel.findByIdAndUpdate(existingUser._id, { tokens: newTokens })

        console.log(newTokens)
        res.status(200).json({ message: "Logout Successfully" })

    } catch (err) {
        console.log(err);
        res.status(400).json({ message: 'something happened' })
    }
}

module.exports = { signUp, signIn, signOut }