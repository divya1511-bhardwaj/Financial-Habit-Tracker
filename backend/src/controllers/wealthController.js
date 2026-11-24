const mongoose = require("mongoose");
const WealthItem = require("../models/WealthItem");

const addWealthItem = async (req, res) => {
    try {
        const { name, type, category, amount } = req.body;

        if (
            !name?.trim() ||
            !category?.trim() ||
            !["ASSET", "LIABILITY"].includes(type) ||
            !Number.isFinite(amount) ||
            amount < 0
        ) {
            return res.status(400).json({
                message: "Provide valid name, type, category and amount"
            });
        }

        const item = await WealthItem.create({
            user: req.user.userId,
            name,
            type,
            category,
            amount
        });

        return res.status(201).json({
            message: "Wealth item added successfully",
            item
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to add wealth item"
        });
    }
};

const getWealthItems = async (req, res) => {
    try {
        const items = await WealthItem.find({
            user: req.user.userId
        }).sort({ createdAt: -1 });

        return res.status(200).json({ items });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to fetch wealth items"
        });
    }
};

const getWealthSummary = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.userId);

        const result = await WealthItem.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: "$type",
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const assets =
            result.find(item => item._id === "ASSET")?.total || 0;

        const liabilities =
            result.find(item => item._id === "LIABILITY")?.total || 0;

        return res.status(200).json({
            totalAssets: assets,
            totalLiabilities: liabilities,
            netWorth: assets - liabilities
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to calculate wealth summary"
        });
    }
};

const updateWealthItem = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid wealth item ID"
            });
        }

        const allowedFields = ["name", "type", "category", "amount"];
        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (
            updates.name !== undefined &&
            (typeof updates.name !== "string" || !updates.name.trim())
        ) {
            return res.status(400).json({
                message: "Name must not be empty"
            });
        }

        if (
            updates.category !== undefined &&
            (typeof updates.category !== "string" || !updates.category.trim())
        ) {
            return res.status(400).json({
                message: "Category must not be empty"
            });
        }

        if (
            updates.type !== undefined &&
            !["ASSET", "LIABILITY"].includes(updates.type)
        ) {
            return res.status(400).json({
                message: "Type must be ASSET or LIABILITY"
            });
        }

        if (
            updates.amount !== undefined &&
            (!Number.isFinite(updates.amount) || updates.amount < 0)
        ) {
            return res.status(400).json({
                message: "Amount must be a non-negative number"
            });
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "Provide at least one valid field to update"
            });
        }

        const item = await WealthItem.findOneAndUpdate(
            { _id: req.params.id, user: req.user.userId },
            { $set: updates },
            { returnDocument: "after", runValidators: true }
        );

        if (!item) {
            return res.status(404).json({
                message: "Wealth item not found"
            });
        }

        return res.status(200).json({
            message: "Wealth item updated successfully",
            item
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to update wealth item"
        });
    }
};

module.exports = {
    addWealthItem,
    getWealthItems,
    getWealthSummary,
    updateWealthItem
};