const express = require('express');
const cookieParser = require('cookie-parser')
require('dotenv').config();
require('./config/dbConnect')

//routes
const userRouter = require('./routes/userRoutes');
const noteRouter = require('./routes/noteRoutes');

const port = process.env.PORT || 5000;
// const key = process.env.secretKey || 'no'
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/notes', noteRouter);
app.use('/users', userRouter);

const multer = require('multer')

app.use((req, res, next) => {
    console.log("HTTP Method : " + req.method + "\nURL : " + req.url)
    next();
})

app.get('/', (req, res) => {
    console.log('Hello')
    console.log('Cookies: ', req.cookies.authorization)
    // Cookies that have been signed
    console.log('Signed Cookies: ', req.signedCookies)
    res.send("<h1>hello world</h1>")
})

app.listen(port, () => {
    console.log("server is running at note " + port);
    // console.log(key)
})
