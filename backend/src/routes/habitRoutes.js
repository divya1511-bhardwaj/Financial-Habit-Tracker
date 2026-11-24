const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
    createHabit,
    getHabits,
    completeHabit,
    getHabitProgress
} = require("../controllers/habitController");

const router = express.Router();

router.use(protect);

router.post("/", createHabit);
router.get("/", getHabits);
router.patch("/:id/complete", completeHabit);
router.get("/progress", getHabitProgress);

module.exports = router;