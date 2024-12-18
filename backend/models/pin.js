const mongoose = require('mongoose');

const pinSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true, // This will ensure the PIN is associated with a user
  },
  pin: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const PIN = mongoose.model('PIN', pinSchema);

module.exports = PIN;
