const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
    addTransaction,
    getTransactions,
    updateTransaction,
    deleteTransaction
} = require("../controllers/transactionController");

const router = express.Router();

router.use(protect);

router.post("/", addTransaction);

router.get("/", getTransactions);

router.put("/:id", updateTransaction);

router.delete("/:id", deleteTransaction);

module.exports = router;