const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["Deposit", "Withdraw"],
      required: true,
    },
    amount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
