const express = require("express");
const cors = require("cors");

const authRoutes = require("./src/routes/authRoutes");
const testRoutes = require("./src/routes/testRoutes");
const transactionRoutes = require("./src/routes/transactionRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const habitRoutes = require("./src/routes/habitRoutes");
const savingsGoalRoutes = require("./src/routes/savingsGoalRoutes");
 const wealthRoutes = require("./src/routes/wealthRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const wealthSnapshotRoutes = require("./src/routes/wealthSnapshotRoutes");
const feedbackRoutes = require("./src/routes/feedbackRoutes");
const adminFeedbackRoutes = require("./src/routes/adminFeedbackRoutes");



const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Financial Habit Tracker API is running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/savings-goals", savingsGoalRoutes);
app.use("/api/wealth", wealthRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wealth/snapshots", wealthSnapshotRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin/feedback", adminFeedbackRoutes);


module.exports = app;













// For local testing, this is fine. Before deployment, replace the development admin password with a strong secret and protect the admin creation process.