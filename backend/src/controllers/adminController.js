
const mongoose = require("mongoose");
const User = require("../models/User");

// GET /api/admin/stats
const getAdminStats = async (req, res) => {
    try {
        const [
            totalUsers,
            activeUsers,
            inactiveUsers,
            adminUsers
        ] = await Promise.all([
            User.countDocuments({ role: "USER" }),
            User.countDocuments({ role: "USER", active: true }),
            User.countDocuments({ role: "USER", active: false }),
            User.countDocuments({ role: "ADMIN" })
        ]);

        return res.status(200).json({
            stats: {
                totalUsers,
                activeUsers,
                inactiveUsers,
                adminUsers
            }
        });
    } catch (error) {
        console.error("Admin stats error:", error);
        return res.status(500).json({
            message: "Unable to fetch admin statistics"
        });
    }
};

// GET /api/admin/users
const getAllUsers = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, parseInt(req.query.limit, 10) || 10)
        );

        const filter = { role: "USER" };

        if (req.query.search) {
            const search = req.query.search.trim();

            if (search) {
                const escaped = search.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                );

                filter.$or = [
                    { name: { $regex: escaped, $options: "i" } },
                    { email: { $regex: escaped, $options: "i" } }
                ];
            }
        }

        const [users, total] = await Promise.all([
            User.find(filter)
                .select("-password -__v")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),

            User.countDocuments(filter)
        ]);

        return res.status(200).json({
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Fetch users error:", error);
        return res.status(500).json({
            message: "Unable to fetch users"
        });
    }
};

// PATCH /api/admin/users/:id/status
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { active } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        if (typeof active !== "boolean") {
            return res.status(400).json({
                message: "active must be true or false"
            });
        }

        const user = await User.findOneAndUpdate(
            { _id: id, role: "USER" },
            { $set: { active } },
            {
                returnDocument: "after",
                runValidators: true
            }
        ).select("-password -__v");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: `User ${active ? "activated" : "deactivated"} successfully`,
            user
        });
    } catch (error) {
        console.error("Update user status error:", error);
        return res.status(500).json({
            message: "Unable to update user status"
        });
    }
};

module.exports = {
    getAdminStats,
    getAllUsers,
    updateUserStatus
};
