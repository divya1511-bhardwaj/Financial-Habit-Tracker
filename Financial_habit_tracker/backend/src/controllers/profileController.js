const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const UserSettings = require("../models/UserSettings");

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select("-password -__v");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to fetch profile"
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name } = req.body;

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                message: "A valid name is required"
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: { name: name.trim() } },
            { returnDocument: "after", runValidators: true }
        ).select("-password -__v");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            user
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to update profile"
        });
    }
};

const getSettings = async (req, res) => {
    try {
        const settings = await UserSettings.findOneAndUpdate(
            { user: req.user.userId },
            { $setOnInsert: { user: req.user.userId } },
            {
                upsert: true,
                returnDocument: "after",
                runValidators: true
            }
        );

        return res.status(200).json({ settings });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to fetch settings"
        });
    }
};

const updateSettings = async (req, res) => {
    try {
        const allowed = [
            "currency",
            "remindersEnabled",
            "emailNotifications",
            "theme"
        ];

        const updates = {};

        for (const field of allowed) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "Provide at least one valid setting"
            });
        }

        const settings = await UserSettings.findOneAndUpdate(
            { user: req.user.userId },
            {
                $set: updates,
                $setOnInsert: { user: req.user.userId }
            },
            {
                upsert: true,
                returnDocument: "after",
                runValidators: true
            }
        );

        return res.status(200).json({
            message: "Settings updated successfully",
            settings
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        console.error(error);
        return res.status(500).json({
            message: "Unable to update settings"
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (
            typeof currentPassword !== "string" ||
            typeof newPassword !== "string" ||
            newPassword.length < 8
        ) {
            return res.status(400).json({
                message: "Current password and a new password of at least 8 characters are required"
            });
        }

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // This assumes the existing authentication model stores
        // the bcrypt hash in the "password" field.
        const valid = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!valid) {
            return res.status(400).json({
                message: "Current password is incorrect"
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({
            message: "Password changed successfully. Please log in again."
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to change password"
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getSettings,
    updateSettings,
    changePassword
};