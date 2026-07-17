import express from 'express';
import Driver from '../models/Driver.js';
import Booking from '../models/Booking.js';
import { getUserFromRequest } from '../middleware/auth.js';

const router = express.Router();

// Middleware to protect driver routes
router.use((req, res, next) => {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "driver") return res.status(401).json({ message: "Unauthorized" });
    req.user = user;
    next();
});

// GET /api/driver/availability
router.get('/availability', async (req, res) => {
    try {
        const driver = await Driver.findById(req.user.id).select("-password");
        if (!driver) return res.status(404).json({ message: "Driver not found" });
        return res.json({ driver });
    } catch (error) {
        console.error("Driver info error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// PATCH /api/driver/availability
router.patch('/availability', async (req, res) => {
    try {
        const driver = await Driver.findById(req.user.id);
        if (!driver) return res.status(404).json({ message: "Driver not found" });
        
        driver.isAvailable = !driver.isAvailable;
        await driver.save();
        
        return res.json({ message: `You are now ${driver.isAvailable ? "available" : "busy"}`, isAvailable: driver.isAvailable });
    } catch (error) {
        console.error("Availability toggle error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// GET /api/driver/history
router.get('/history', async (req, res) => {
    try {
        const bookings = await Booking.find({ driverId: req.user.id, status: { $in: ["completed", "cancelled", "on_the_way", "accepted"] } }).sort({ createdAt: -1 }).lean();
        return res.json({ bookings });
    } catch (error) {
        console.error("Driver history error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
