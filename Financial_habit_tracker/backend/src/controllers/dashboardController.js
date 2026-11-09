const Transaction = require("../models/Transaction");

const getDashboard = async (req, res) => {
    try {
        const userId = req.user.userId;

        const summary = await Transaction.aggregate([
            {
                $match: {
                    user: new (require("mongoose").Types.ObjectId)(userId)
                }
            },
            {
                $group: {
                    _id: "$type",
                    total: { $sum: "$amount" }
                }
            }
        ]);

        const income = summary.find(
            item => item._id === "INCOME"
        )?.total || 0;

        const expenses = summary.find(
            item => item._id === "EXPENSE"
        )?.total || 0;

        const recentTransactions = await Transaction.find({
            user: userId
        })
            .sort({ date: -1 })
            .limit(5)
            .lean();

        res.status(200).json({
            totalIncome: income,
            totalExpenses: expenses,
            netSavings: income - expenses,
            recentTransactions
        });

    } catch (error) {
        console.error("Dashboard error:", error);

        res.status(500).json({
            message: "Unable to load dashboard"
        });
    }
};

module.exports = { getDashboard };