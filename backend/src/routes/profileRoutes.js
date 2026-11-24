const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
    getProfile,
    updateProfile,
    getSettings,
    updateSettings,
    changePassword
} = require("../controllers/profileController");

const router = express.Router();

router.use(protect);

router.get("/", getProfile);
router.put("/", updateProfile);

router.get("/settings", getSettings);
router.put("/settings", updateSettings);

router.patch("/change-password", changePassword);

module.exports = router;