
const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        category: {
            type: String,
            enum: ["SUGGESTION", "BUG", "COMPLAINT", "OTHER"],
            required: true
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        },
        status: {
            type: String,
            enum: ["OPEN", "IN_PROGRESS", "RESOLVED"],
            default: "OPEN"
        },
        adminResponse: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: ""
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
