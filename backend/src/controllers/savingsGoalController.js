const mongoose = require("mongoose");
const SavingsGoal = require("../models/SavingsGoal");

const createGoal = async (req, res) => {
    try {
        const { name, targetAmount, deadline, category } = req.body;

        if (
            !name?.trim() ||
            !Number.isFinite(targetAmount) ||
            targetAmount <= 0 ||
            !deadline ||
            Number.isNaN(Date.parse(deadline))
        ) {
            return res.status(400).json({
                message: "Valid name, targetAmount and deadline are required"
            });
        }

        const goal = await SavingsGoal.create({
            user: req.user.userId,
            name,
            targetAmount,
            deadline: new Date(deadline),
            category
        });

        return res.status(201).json({
            message: "Savings goal created successfully",
            goal
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to create savings goal"
        });
    }
};

const getGoals = async (req, res) => {
    try {
        const goals = await SavingsGoal.find({
            user: req.user.userId
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            goals: goals.map(goal => ({
                ...goal.toObject(),
                progress: Math.min(
                    100,
                    Math.round(
                        (goal.currentAmount / goal.targetAmount) * 100
                    )
                )
            }))
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to fetch savings goals"
        });
    }
};

const addContribution = async (req, res) => {
    try {
        const amount = req.body?.amount;

if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0
) {
    return res.status(400).json({
        message: "A valid positive numeric amount is required"
    });
}

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({
                message: "Contribution amount must be greater than zero"
            });
        }

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid savings goal ID"
            });
        }

        const goal = await SavingsGoal.findOne({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!goal) {
            return res.status(404).json({
                message: "Savings goal not found"
            });
        }

        goal.currentAmount += amount;
        await goal.save();

        return res.status(200).json({
            message: "Contribution added successfully",
            goal,
            progress: Math.min(
                100,
                Math.round(
                    (goal.currentAmount / goal.targetAmount) * 100
                )
            )
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to add contribution"
        });
    }
};

module.exports = {
    createGoal,
    getGoals,
    addContribution
};