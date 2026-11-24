
const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

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

// GET /api/admin/users?page=1&limit=10
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

// POST /api/admin/create-admin
const createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Required field validation
        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({
                message: "Please enter a valid email"
            });
        }

        // Password validation
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        // Check existing account
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "An account with this email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "ADMIN",
            active: true
        });

        return res.status(201).json({
            message: "Admin created successfully",
            admin: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                active: admin.active
            }
        });

    } catch (error) {
        console.error("Create admin error:", error);

        // Handle duplicate email race condition
        if (error.code === 11000) {
            return res.status(409).json({
                message: "An account with this email already exists"
            });
        }

        return res.status(500).json({
            message: "Unable to create admin"
        });
    }
};

// GET /api/admin/admins?page=1&limit=10
const getAllAdmins = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, parseInt(req.query.limit, 10) || 10)
        );

        const filter = { role: "ADMIN" };

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

        const [admins, total] = await Promise.all([
            User.find(filter)
                .select("-password -__v")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),

            User.countDocuments(filter)
        ]);

        return res.status(200).json({
            admins,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Fetch admins error:", error);

        return res.status(500).json({
            message: "Unable to fetch admins"
        });
    }
};

// PATCH /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        if (!["USER", "ADMIN"].includes(role)) {
            return res.status(400).json({
                message: "Role must be USER or ADMIN"
            });
        }

        // Prevent self-role changes
        if (id === req.user.userId) {
            return res.status(403).json({
                message: "You cannot change your own admin role"
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.role === role) {
            return res.status(400).json({
                message: `User already has the ${role} role`
            });
        }

        // Prevent demoting the last active administrator
        if (
            user.role === "ADMIN" &&
            role === "USER" &&
            user.active
        ) {
            const activeAdmins = await User.countDocuments({
                role: "ADMIN",
                active: true
            });

            if (activeAdmins <= 1) {
                return res.status(400).json({
                    message: "Cannot demote the last active admin"
                });
            }
        }

        user.role = role;
        await user.save();

        return res.status(200).json({
            message: `User ${
                role === "ADMIN"
                    ? "promoted to admin"
                    : "demoted to user"
            } successfully`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                active: user.active
            }
        });

    } catch (error) {
        console.error("Update user role error:", error);

        return res.status(500).json({
            message: "Unable to update user role"
        });
    }
};

module.exports = {
    getAdminStats,
    getAllUsers,
    updateUserStatus,
    createAdmin,
    getAllAdmins,
    updateUserRole
};
