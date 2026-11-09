
const express = require("express");
const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

const {
    getAllFeedback,
    updateFeedbackStatus
} = require("../controllers/feedbackController");

const router = express.Router();

router.use(protect, requireAdmin);

router.get("/", getAllFeedback);
router.patch("/:id", updateFeedbackStatus);

module.exports = router;
