const express = require("express");
const { body } = require("express-validator");

const {
    register,
    login,
    forgotPassword,
    resetPassword
} = require("../controllers/authController");

const router = express.Router();

router.post(
    "/register",

    [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Name is required"),

        body("email")
            .trim()
            .isEmail()
            .withMessage("Enter a valid email"),

        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters")
    ],

    register
);

router.post(
    "/login",

    [
        body("email")
            .trim()
            .isEmail()
            .withMessage("Enter a valid email"),

        body("password")
            .notEmpty()
            .withMessage("Password is required")
    ],

    login
);
router.post(
    "/forgot-password",
    [
        body("email")
            .trim()
            .isEmail()
            .withMessage("Enter a valid email")
    ],
    forgotPassword
);

router.post(
    "/reset-password/:token",
    [
        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters")
    ],
    resetPassword
);




module.exports = router;