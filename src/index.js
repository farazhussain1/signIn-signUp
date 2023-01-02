const express = require('express');
const app = express();
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

const userRouter = require('./routes/userRoutes');
const noteRouter = require('./routes/noteRoutes');
const auth = require('./middlewares/auth');

app.use(express.json());

app.use((req, res, next) => {
    console.log("HTTP Method : " + req.method + "\nURL : " + req.url)
    next();
})

app.use('/users', userRouter);
app.use('/notes', noteRouter);

app.get('/', (req, res) => {
    console.log('Hello')
    res.send("<h1>hello world</h1>")
})

mongoose.connect('mongodb://localhost:27017/signInSignUpUserData')
    .then(() => {
        app.listen(5000, () => {
            console.log("server is running at note 5000");
        })
    })
    .catch((error) => {
        console.log(error);
    })