const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  pin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PIN', // Reference to the PIN model
    required: false, // You can change it to true if needed
  },
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
