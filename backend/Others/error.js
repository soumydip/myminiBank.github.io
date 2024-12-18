const express=require('express')
const app=express()

app.use((req, res, next) => {
    const error = new Error("Something went wrong");
    next(error);  //go to next 
});

app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).send("Internal Server Error");
});
