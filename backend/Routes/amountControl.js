const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Transaction = require("../models/Transaction");

// **Route: Add Money**
router.post("/add", async (req, res, next) => {
  const { userId, amount } = req.body;

  if (!userId || amount <= 0) {
    return next({ statusCode: 400, message: "Invalid userId or amount" });
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { balance: amount } },
      { new: true }
    );

    if (!user) {
      return next({ statusCode: 404, message: "User not found" });
    }

    const transaction = await Transaction.create({
      userId,
      type: "Deposit",
      amount,
    });

    // Populate user details and transaction info
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate("userId", "name");

    res.status(200).json({
      message: "Money added successfully",
      transactionId: populatedTransaction._id,
      userName: populatedTransaction.userId.name,
      amountAdded: populatedTransaction.amount,
      transactionType: populatedTransaction.type,
      date: populatedTransaction.timestamp,
      newBalance: user.balance,
    });
  } catch (error) {
    next(error); // Pass the error to the error middleware
  }
});

// **Route: Withdraw Money**
router.post("/withdraw", async (req, res, next) => {
  const { userId, amount } = req.body;

  if (!userId || amount <= 0) {
    return next({ statusCode: 400, message: "Invalid userId or amount" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next({ statusCode: 404, message: "User not found" });
    }

    if (user.balance < amount) {
      return next({ statusCode: 400, message: "Insufficient balance" });
    }

    user.balance -= amount;
    await user.save();

    const transaction = await Transaction.create({
      userId,
      type: "Withdraw",
      amount,
    });

    // Populate user details and transaction info
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate("userId", "name");

    res.status(200).json({
      message: "Money withdrawn successfully",
      transactionId: populatedTransaction._id,
      userName: populatedTransaction.userId.name,
      amountWithdrawn: populatedTransaction.amount, // Display the amount withdrawn
      transactionType: populatedTransaction.type,
      date: populatedTransaction.timestamp,
      newBalance: user.balance,
    });
  } catch (error) {
    next(error);
  }
});

// **Route: Check Balance**
router.post("/balance", async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return next({ statusCode: 400, message: "User ID is required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next({ statusCode: 404, message: "User not found" });
    }

    res.status(200).json({
      message: "Balance retrieved successfully",
      balance: user.balance,
    });
  } catch (error) {
    next(error);
  }
});

// **Route: Transaction History**
router.get("/transactions/:userId", async (req, res, next) => {
  const { userId } = req.params; // Get userId from URL

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const transactions = await Transaction.find({ userId }).sort({ timestamp: -1 });

    if (transactions.length === 0) {
      return res.status(404).json({ message: "No transactions found" });
    }

    const populatedTransactions = await Transaction.find({ userId })
      .sort({ timestamp: -1 })
      .populate("userId", "name");

    res.status(200).json({
      message: "Transaction history retrieved successfully",
      transactions: populatedTransactions.map((transaction) => ({
        transactionId: transaction._id,
        type: transaction.type,
        amount: transaction.amount,
        date: transaction.timestamp,
        userName: transaction.userId.name,
      })),
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});



module.exports = router;
