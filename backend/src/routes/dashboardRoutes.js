const express = require("express");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const { getDashboard } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/", protect, allowRoles("USER"), getDashboard);

module.exports = router;