const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();


router.get(
    "/user",
    protect,
    allowRoles("USER"),
    (req, res) => {
        res.json({
            message: "User route accessed successfully",
            user: req.user
        });
    }
);


router.get(
    "/admin",
    protect,
    allowRoles("ADMIN"),
    (req, res) => {
        res.json({
            message: "Admin route accessed successfully",
            user: req.user
        });
    }
);


module.exports = router;