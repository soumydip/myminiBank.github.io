const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const verifyToken = require("../auth/verifyToken");
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Route: Add user and set token in cookie
router.post(
  "/adduser",
  [
    body("name").isLength({ min: 5 }).withMessage("Name must be at least 5 characters long"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
    body("mobile")
      .isLength({ min: 10, max: 15 })
      .withMessage("Mobile number must be between 10 and 15 digits")
      .isNumeric()
      .withMessage("Mobile number must contain only numbers"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, mobile } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Email already exists" });
      }

      const existingMobile = await User.findOne({ mobile });
      if (existingMobile) {
        return res.status(400).json({ success: false, message: "Mobile number already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        name,
        email,
        mobile,
        password: hashedPassword,
      });

      await newUser.save();

      // Generate JWT token
      const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: "30d" });

      // Response with token
      res.status(201).json({ success: true, message: "User added successfully", token });
    } catch (error) {
      next(error);
    }
  }
);



// Route: Protected route to access user profile
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(400).json({ success: false, message: 'Invalid email. Please check and try again.' });
      }

      // Validate password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ success: false, message: 'Invalid password. Please try again.' });
      }

      // Generate JWT token
      const token = jwt.sign({ user: { id: user._id, name: user.name } }, process.env.JWT_SECRET, { expiresIn: '30d' });

      return res.status(200).json({ success: true, message: 'Login successful!', token });
  } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

router.get("/profile", verifyToken, (req, res) => {
  res.status(200).json({
      success: true,
      message: "User verified successfully",
      user: req.user,
  });
}); 




module.exports = router;    // Verify token middleware