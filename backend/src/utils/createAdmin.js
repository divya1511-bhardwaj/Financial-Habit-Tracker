require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const connectDB = require("../config/db");
const User = require("../models/User");

const createAdmin = async () => {
    try {
        await connectDB();

        const email = "admin@financialtracker.com";

        const existingAdmin = await User.findOne({ email });

        if (existingAdmin) {
            console.log("Admin already exists");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash("Admin@123", 10);

        await User.create({
            name: "System Admin",
            email,
            password: hashedPassword,
            role: "ADMIN"
        });

        console.log("Admin created successfully");
        console.log("Email: admin@financialtracker.com");
        console.log("Password: Admin@123");

        process.exit(0);

    } catch (error) {
        console.error("Error creating admin:", error.message);
        process.exit(1);
    }
};

createAdmin();