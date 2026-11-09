
const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
    createSnapshot,
    getSnapshots
} = require("../controllers/wealthSnapshotController");

const router = express.Router();

router.use(protect);

router.post("/", createSnapshot);
router.get("/", getSnapshots);

module.exports = router;
