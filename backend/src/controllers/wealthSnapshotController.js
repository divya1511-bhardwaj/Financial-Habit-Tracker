
const WealthItem = require("../models/WealthItem");
const WealthSnapshot = require("../models/WealthSnapshot");

const createSnapshot = async (req, res) => {
    try {
        const userId = req.user.userId;

        const items = await WealthItem.find({ user: userId }).lean();

        let totalAssets = 0;
        let totalLiabilities = 0;

        for (const item of items) {
            if (item.type === "ASSET") {
                totalAssets += item.amount;
            } else if (item.type === "LIABILITY") {
                totalLiabilities += item.amount;
            }
        }

        const now = new Date();
        const snapshotDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

        const snapshot = await WealthSnapshot.findOneAndUpdate(
            { user: userId, snapshotDate },
            {
                $set: {
                    totalAssets,
                    totalLiabilities,
                    netWorth: totalAssets - totalLiabilities
                },
                $setOnInsert: {
                    user: userId,
                    snapshotDate
                }
            },
            {
                upsert: true,
                returnDocument: "after",
                runValidators: true
            }
        );

        return res.status(200).json({
            message: "Wealth snapshot saved successfully",
            snapshot
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to save wealth snapshot"
        });
    }
};

const getSnapshots = async (req, res) => {
    try {
        const query = { user: req.user.userId };

        if (req.query.from || req.query.to) {
            query.snapshotDate = {};

            if (req.query.from) {
                const from = new Date(req.query.from);

                if (Number.isNaN(from.getTime())) {
                    return res.status(400).json({
                        message: "Invalid from date"
                    });
                }

                query.snapshotDate.$gte = from;
            }

            if (req.query.to) {
                const to = new Date(req.query.to);

                if (Number.isNaN(to.getTime())) {
                    return res.status(400).json({
                        message: "Invalid to date"
                    });
                }

                to.setHours(23, 59, 59, 999);
                query.snapshotDate.$lte = to;
            }
        }

        const snapshots = await WealthSnapshot.find(query)
            .sort({ snapshotDate: 1 })
            .select("-__v");

        return res.status(200).json({
            count: snapshots.length,
            snapshots
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to fetch wealth history"
        });
    }
};

module.exports = {
    createSnapshot,
    getSnapshots
};
