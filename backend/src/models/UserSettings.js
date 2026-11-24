const mongoose = require("mongoose");

const userSettingsSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        currency: {
            type: String,
            enum: ["INR", "USD", "EUR", "GBP"],
            default: "INR"
        },
        remindersEnabled: {
            type: Boolean,
            default: true
        },
        emailNotifications: {
            type: Boolean,
            default: false
        },
        theme: {
            type: String,
            enum: ["light", "dark"],
            default: "light"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("UserSettings", userSettingsSchema);