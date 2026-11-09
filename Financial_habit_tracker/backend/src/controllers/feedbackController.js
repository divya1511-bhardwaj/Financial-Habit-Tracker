
const Feedback = require("../models/Feedback");

const submitFeedback = async (req, res) => {
    try {
        const { category, message } = req.body;

        const allowedCategories = [
            "SUGGESTION",
            "BUG",
            "COMPLAINT",
            "OTHER"
        ];

        if (
            !allowedCategories.includes(category) ||
            typeof message !== "string" ||
            !message.trim() ||
            message.trim().length > 2000
        ) {
            return res.status(400).json({
                message: "Provide a valid category and message (maximum 2000 characters)"
            });
        }

        const feedback = await Feedback.create({
            user: req.user.userId,
            category,
            message: message.trim()
        });

        return res.status(201).json({
            message: "Feedback submitted successfully",
            feedback
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to submit feedback"
        });
    }
};

const getMyFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find({
            user: req.user.userId
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            count: feedback.length,
            feedback
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to fetch your feedback"
        });
    }
};

const getAllFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .limit(100);

        return res.status(200).json({
            count: feedback.length,
            feedback
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to fetch feedback"
        });
    }
};

const updateFeedbackStatus = async (req, res) => {
    try {
        const { status, adminResponse } = req.body;
        const allowedStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid feedback status"
            });
        }

        if (
            adminResponse !== undefined &&
            (typeof adminResponse !== "string" ||
                adminResponse.length > 2000)
        ) {
            return res.status(400).json({
                message: "Admin response must be a string of at most 2000 characters"
            });
        }

        const updates = { status };

        if (adminResponse !== undefined) {
            updates.adminResponse = adminResponse.trim();
        }

        const item = await Feedback.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { returnDocument: "after", runValidators: true }
        );

        if (!item) {
            return res.status(404).json({
                message: "Feedback not found"
            });
        }

        return res.status(200).json({
            message: "Feedback updated successfully",
            feedback: item
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to update feedback"
        });
    }
};

module.exports = {
    submitFeedback,
    getMyFeedback,
    getAllFeedback,
    updateFeedbackStatus
};
