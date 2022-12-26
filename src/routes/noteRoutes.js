const express = require('express');
const noteRouter = express.Router();

noteRouter.get('/',(req,res)=>{
    res.send('this is get request');
});

noteRouter.post('/',(req,res)=>{
    res.send('this is post request');
});

module.exports = noteRouter;