
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Confirm the token contains a valid MongoDB user ID.
        if (
            !decoded.userId ||
            !mongoose.isValidObjectId(decoded.userId)
        ) {
            return res.status(401).json({
                message: "Invalid token payload"
            });
        }

        // Check that the account still exists and is active.
        const user = await User.findById(decoded.userId)
            .select("_id role active");

        if (!user || !user.active) {
            return res.status(401).json({
                message: "Account not found or deactivated"
            });
        }

        req.user = {
            userId: user._id.toString(),
            role: user.role
        };

        return next();
    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Authentication check failed"
        });
    }
};

module.exports = protect;
