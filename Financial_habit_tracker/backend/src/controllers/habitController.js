const Habit = require("../models/Habit");

const getToday = () => {
    const now = new Date();

    return [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("-");
};

// CREATE HABIT
const createHabit = async (req, res) => {
    try {
        const { name, description, frequency } = req.body;

        if (!name || !frequency) {
            return res.status(400).json({
                message: "Name and frequency are required"
            });
        }

        const habit = await Habit.create({
            user: req.user.userId,
            name,
            description,
            frequency
        });

        return res.status(201).json({
            message: "Habit created successfully",
            habit
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Unable to create habit"
        });
    }
};

// GET MY HABITS
const getHabits = async (req, res) => {
    try {
        const habits = await Habit.find({
            user: req.user.userId,
            active: true
        }).sort({ createdAt: -1 });

        return res.status(200).json({ habits });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Unable to fetch habits"
        });
    }
};

// MARK HABIT COMPLETE FOR TODAY
const completeHabit = async (req, res) => {
    try {
        const habit = await Habit.findOne({
            _id: req.params.id,
            user: req.user.userId,
            active: true
        });

        if (!habit) {
            return res.status(404).json({
                message: "Habit not found"
            });
        }

        const today = getToday();

        if (habit.completedDates.includes(today)) {
            return res.status(409).json({
                message: "Habit already completed today"
            });
        }

        habit.completedDates.push(today);
        await habit.save();

        return res.status(200).json({
            message: "Habit completed successfully",
            habit
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Unable to complete habit"
        });
    }
};

// GET BASIC HABIT PROGRESS
const getHabitProgress = async (req, res) => {
    try {
        const habits = await Habit.find({
            user: req.user.userId,
            active: true
        });

        const progress = habits.map((habit) => ({
            id: habit._id,
            name: habit.name,
            frequency: habit.frequency,
            totalCompletions: habit.completedDates.length,
            completedToday: habit.completedDates.includes(getToday())
        }));

        return res.status(200).json({ progress });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Unable to fetch habit progress"
        });
    }
};

module.exports = {
    createHabit,
    getHabits,
    completeHabit,
    getHabitProgress
};