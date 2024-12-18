const express = require('express');
const bcrypt = require('bcryptjs');  // bcryptjs ব্যবহার করা হচ্ছে
const User = require('../models/user');
const PIN = require('../models/pin');
const router = express.Router();

// 1. **Create PIN** API
router.post('/createPin', async (req, res) => {
    const { userId, pin } = req.body;
  
    if (!userId || !pin) {
      return res.status(400).json({ success: false, message: 'User ID and PIN are required' });
    }
  
    try {
      // Find user by ID
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      // Check if user already has a PIN set
      if (user.pin) {
        return res.status(400).json({ success: false, message: 'PIN is already set for this user' });
      }
  
      // Hash the PIN using bcryptjs
      const hashedPin = await bcrypt.hash(pin, 10); // bcryptjs hash function
  
      // Create a new PIN document
      const newPin = new PIN({
        userId,
        pin: hashedPin,
      });
  
      // Save the PIN
      await newPin.save();
  
      // Update user with the new PIN reference
      user.pin = newPin._id;
      await user.save();
  
      res.status(201).json({ success: true, message: 'PIN created and linked to user successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  

// 2. **Verify PIN** API
router.post('/verifyPin', async (req, res) => {
  const { userId, pin } = req.body;

  if (!userId || !pin) {
    return res.status(400).json({ success: false, message: 'User ID and PIN are required' });
  }

  try {
    // Find the user and populate the PIN reference
    const user = await User.findById(userId).populate('pin');

    if (!user || !user.pin) {
      return res.status(404).json({ success: false, message: 'User or PIN not found' });
    }

    // Compare the provided PIN with the stored hashed PIN using bcryptjs
    const isMatch = await bcrypt.compare(pin, user.pin.pin); // bcryptjs compare function

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid PIN' });
    }

    res.status(200).json({ success: true, message: 'PIN verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 3. **Update PIN** API
router.post('/updatePin', async (req, res) => {
  const { userId, oldPin, newPin } = req.body;

  if (!userId || !oldPin || !newPin) {
    return res.status(400).json({ success: false, message: 'User ID, old PIN, and new PIN are required' });
  }

  try {
    // Find user and their associated PIN
    const user = await User.findById(userId).populate('pin');

    if (!user || !user.pin) {
      return res.status(404).json({ success: false, message: 'User or PIN not found' });
    }

    // Verify the old PIN using bcryptjs
    const isMatch = await bcrypt.compare(oldPin, user.pin.pin); // bcryptjs compare function

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect old PIN' });
    }
    // Hash the new PIN using bcryptjs
    const hashedNewPin = await bcrypt.hash(newPin, 10); // bcryptjs hash function

    // Update the PIN
    user.pin.pin = hashedNewPin;
    await user.pin.save();
    

    res.status(200).json({ success: true, message: 'PIN updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


//reset pin by email address
router.post('/resetPin', async (req, res) => {
  const { userId, email, newPin } = req.body;

  // Check if userId, email, and newPin are provided
  if (!userId || !email || !newPin) {
    return res.status(400).json({ success: false, message: 'User ID, email, and new PIN are required' });
  }

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    // If the user is not found
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if the email provided matches the email in the database
    if (user.email !== email) {
      return res.status(400).json({ success: false, message: 'Email does not match' });
    }

    // Hash the new PIN
    const hashedNewPin = await bcrypt.hash(newPin, 10);

    // Check if user already has a PIN document (this should be done with PIN reference, as in the creation process)
    if (user.pin) {
      // Find the existing PIN document
      const pin = await PIN.findById(user.pin);

      if (pin) {
        // Update the existing PIN with the new hashed PIN
        pin.pin = hashedNewPin;
        await pin.save();
        return res.status(200).json({ success: true, message: 'PIN updated successfully' });
      }
    }

    // If no PIN is linked, create a new PIN document
    const newPinDoc = new PIN({
      userId,
      pin: hashedNewPin,
    });

    // Save the new PIN document
    await newPinDoc.save();

    // Update the user's PIN reference
    user.pin = newPinDoc._id;
    await user.save();

    res.status(200).json({ success: true, message: 'PIN reset successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error, please try again later' });
  }
});


module.exports = router;
