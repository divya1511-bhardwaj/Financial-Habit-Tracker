// const crypto = require("crypto");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { validationResult } = require("express-validator");
// const User = require("../models/User");
// const transporter = require("../config/mailer");

// const register = async (req, res) => {
//     try {
//         const errors = validationResult(req);

//         if (!errors.isEmpty()) {
//             return res.status(400).json({
//                 message: "Validation failed",
//                 errors: errors.array()
//             });
//         }

//         const { name, email, password } = req.body;

//         const existingUser = await User.findOne({ email });

//         if (existingUser) {
//             return res.status(409).json({
//                 message: "Email already registered"
//             });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);

//         const user = await User.create({
//             name,
//             email,
//             password: hashedPassword
//         });

//         res.status(201).json({
//             message: "Registration successful",
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role
//             }
//         });

//     } catch (error) {
//         console.error(error);

//         res.status(500).json({
//             message: "Server error"
//         });
//     }
// };
// const login = async (req, res) => {
//     try {
//         const errors = validationResult(req);

//         if (!errors.isEmpty()) {
//             return res.status(400).json({
//                 message: "Validation failed",
//                 errors: errors.array()
//             });
//         }

//         const { email, password } = req.body;

//         const user = await User.findOne({ email });

//         if (!user) {
//             return res.status(401).json({
//                 message: "Invalid email or password"
//             });
//         }

//         if (!user.active) {
//             return res.status(403).json({
//                 message: "Your account is inactive"
//             });
//         }

//         const passwordMatch = await bcrypt.compare(
//             password,
//             user.password
//         );

//         if (!passwordMatch) {
//             return res.status(401).json({
//                 message: "Invalid email or password"
//             });
//         }

//         const token = jwt.sign(
//             {
//                 userId: user._id,
//                 role: user.role
//             },
//             process.env.JWT_SECRET,
//             {
//                 expiresIn: "1d"
//             }
//         );

//         res.status(200).json({
//             message: "Login successful",

//             token,

//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role
//             }
//         });

//     } catch (error) {
//         console.error(error);

//         res.status(500).json({
//             message: "Server error"
//         });
//     }
// };
// const forgotPassword = async (req, res) => {
//     try {
//         const email = req.body?.email?.trim().toLowerCase();

//         if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//             return res.status(400).json({
//                 message: "Please enter a valid email"
//             });
//         }

//         const user = await User.findOne({
//             email,
//             active: true
//         });

//         // Do not reveal whether an account exists.
//         if (!user) {
//             return res.status(200).json({
//                 message: "If your account exists, a password reset link has been sent."
//             });
//         }

//         const resetToken = crypto.randomBytes(32).toString("hex");

//         const hashedToken = crypto
//             .createHash("sha256")
//             .update(resetToken)
//             .digest("hex");

//         user.resetPasswordToken = hashedToken;
//         user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

//         await user.save();

//         const resetLink =
//             `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

//         try {
//             await transporter.sendMail({
//                 from: `"Finance Habit Builder" <${process.env.EMAIL_USER}>`,
//                 to: user.email,
//                 subject: "Reset Your Password - Finance Habit Builder",
//                 text: `Hello,

// We received a request to reset your password.

// Open this link to create a new password:
// ${resetLink}

// This link expires in 10 minutes.

// If you did not request this, please ignore this email.`
//             });
//         } catch (mailError) {
//             user.resetPasswordToken = undefined;
//             user.resetPasswordExpires = undefined;
//             await user.save();

//             throw mailError;
//         }

//         return res.status(200).json({
//             message: "If your account exists, a password reset link has been sent."
//         });

//     } catch (error) {
//         console.error("Forgot password error:", error);

//         return res.status(500).json({
//             message: "Unable to send reset email. Please try again."
//         });
//     }
// };
// module.exports = {
//     register,
//     login,
//     forgotPassword,
//     resetPassword
// };




const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const User = require("../models/User");
const transporter = require("../config/mailer");

// REGISTER
const register = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Validation failed",
                errors: errors.array()
            });
        }

        const { name, email, password } = req.body;

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword
        });

        return res.status(201).json({
            message: "Registration successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// LOGIN
const login = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Validation failed",
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if (!user.active) {
            return res.status(403).json({
                message: "Your account is inactive"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
    try {
        const email = req.body?.email?.trim().toLowerCase();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email"
            });
        }

        const user = await User.findOne({
            email,
            active: true
        });

        // Generic response prevents account enumeration.
        if (!user) {
            return res.status(200).json({
                message: "If your account exists, a password reset link has been sent."
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

        await user.save();

        const resetLink =
            `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        try {
            await transporter.sendMail({
                from: `"Finance Habit Builder" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: "Reset Your Password - Finance Habit Builder",

                text: `Hello ${user.name},

We received a request to reset your password.

Click the link below to create a new password:

${resetLink}

This link expires in 10 minutes.

If you did not request this, please ignore this email.`
            });

        } catch (mailError) {

            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            await user.save();

            throw mailError;
        }

        return res.status(200).json({
            message: "If your account exists, a password reset link has been sent."
        });

    } catch (error) {
        console.error("Forgot password error:", error);

        return res.status(500).json({
            message: "Unable to send reset email. Please try again."
        });
    }
};


// RESET PASSWORD
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body || {};

        if (!token || !password || password.length < 6) {
            return res.status(400).json({
                message: "Valid token and password of at least 6 characters are required"
            });
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
            active: true
        }).select("+resetPasswordToken +resetPasswordExpires");

        if (!user) {
            return res.status(400).json({
                message: "Reset token is invalid or expired"
            });
        }

        user.password = await bcrypt.hash(password, 10);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return res.status(200).json({
            message: "Password reset successful. Please login again."
        });

    } catch (error) {
        console.error("Reset password error:", error);

        return res.status(500).json({
            message: "Unable to reset password"
        });
    }
};


module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword
};
