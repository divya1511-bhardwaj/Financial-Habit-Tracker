const Transaction = require("../models/Transaction");


// ADD TRANSACTION
const addTransaction = async (req, res) => {
    try {
        const {
            type,
            amount,
            category,
            description,
            date
        } = req.body;

        if (!type || !amount || !category) {
            return res.status(400).json({
                message: "Type, amount and category are required"
            });
        }

        const transaction = await Transaction.create({
            user: req.user.userId,
            type,
            amount,
            category,
            description,
            date
        });

        res.status(201).json({
            message: "Transaction added successfully",
            transaction
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// GET MY TRANSACTIONS
const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            user: req.user.userId
        }).sort({ date: -1 });

        res.status(200).json({
            transactions
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// UPDATE TRANSACTION
const updateTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user.userId
            },
            req.body,
            {
              returnDocument: "after",
    runValidators: true
            }
        );

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        res.status(200).json({
            message: "Transaction updated successfully",
            transaction
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// DELETE TRANSACTION
const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findOneAndDelete({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        res.status(200).json({
            message: "Transaction deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    addTransaction,
    getTransactions,
    updateTransaction,
    deleteTransaction
};



// user: req.user.userId    and
// {
//     _id: req.params.id,
//     user: req.user.userId
// }
// This means Divya can only modify/delete her own transactions.
