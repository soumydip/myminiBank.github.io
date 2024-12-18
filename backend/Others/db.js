const mongoose = require("mongoose");
const mongoURI = process.env.MONGO_URI; 

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI,{
            maxPoolSize:20,  //maxPoolSize
        });
        console.log("Connected to MongoDB successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1); 
    }
};

module.exports = connectToMongo;
