const express = require("express");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
    getAdminStats,
    getAllUsers,
    updateUserStatus,
    createAdmin,
     getAllAdmins,
    updateUserRole
} = require("../controllers/adminController");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/status", updateUserStatus);
router.post("/create-admin", createAdmin);
router.get("/admins", getAllAdmins);
router.patch("/users/:id/role", updateUserRole);

module.exports = router;