const jwt = require("jsonwebtoken");
const User = require("../models/user");
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = async (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.user.id;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user; 
        next();
    } catch (error) {
        console.error("Token verification failed:", error.message);
        res.status(400).json({ message: "Invalid token" });
    }
};

module.exports = verifyToken;
