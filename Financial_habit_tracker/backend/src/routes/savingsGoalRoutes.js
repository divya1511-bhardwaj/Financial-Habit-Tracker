const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
    createGoal,
    getGoals,
    addContribution
} = require("../controllers/savingsGoalController");

const router = express.Router();

router.use(protect);

router.post("/", createGoal);
router.get("/", getGoals);
router.post("/:id/contributions", addContribution);

module.exports = router;