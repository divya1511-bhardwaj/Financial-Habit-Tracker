const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
    addWealthItem,
    getWealthItems,
    getWealthSummary,
    updateWealthItem
} = require("../controllers/wealthController");

const router = express.Router();

router.use(protect);

router.post("/items", addWealthItem);
router.get("/items", getWealthItems);
router.get("/summary", getWealthSummary);
router.put("/items/:id", updateWealthItem);

module.exports = router;