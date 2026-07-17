import express from 'express';
import bcrypt from 'bcryptjs';
import Driver from '../models/Driver.js';
import { getUserFromRequest } from '../middleware/auth.js';

const router = express.Router();
const RICKSHAW_REGEX = /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/;

// Middleware to protect all routes in this file
router.use((req, res, next) => {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") return res.status(401).json({ message: "Unauthorized" });
    req.user = user;
    next();
});

// GET /api/admin/drivers
router.get('/', async (req, res) => {
    try {
        const drivers = await Driver.find().select("-password").sort({ createdAt: -1 }).lean();
        return res.json({ drivers });
    } catch (error) {
        console.error("Get drivers error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// POST /api/admin/drivers
router.post('/', async (req, res) => {
    try {
        const { name, phone, password, rickshawNumber } = req.body;
        if (!name || !phone || !password || !rickshawNumber) return res.status(400).json({ message: "All fields are required" });
        
        const normalizedRickshaw = rickshawNumber.trim().toUpperCase();
        if (!RICKSHAW_REGEX.test(normalizedRickshaw)) {
            return res.status(400).json({ message: "Invalid rickshaw number format. Use format like HR01AB1234" });
        }
        
        const existing = await Driver.findOne({ $or: [{ phone }, { rickshawNumber: normalizedRickshaw }] });
        if (existing) return res.status(409).json({ message: "Driver with same phone or rickshaw number already exists" });
        
        const hashedPassword = await bcrypt.hash(password, 12);
        const driver = await Driver.create({ name: name.trim(), phone, password: hashedPassword, rickshawNumber: normalizedRickshaw, email: `${phone}@placeholder.local`, status: "pending" });
        
        return res.status(201).json({ message: "Driver added successfully", driver: { id: driver._id, name: driver.name, phone: driver.phone, rickshawNumber: driver.rickshawNumber, status: driver.status } });
    } catch (error) {
        console.error("Add driver error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// PATCH /api/admin/drivers/:id
router.patch('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        if (!["approved", "suspended", "pending"].includes(status)) return res.status(400).json({ message: "Invalid status" });
        
        const driver = await Driver.findByIdAndUpdate(req.params.id, { status }, { new: true }).select("-password");
        if (!driver) return res.status(404).json({ message: "Driver not found" });
        
        return res.json({ message: `Driver ${status} successfully`, driver });
    } catch (error) {
        console.error("Update driver error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// DELETE /api/admin/drivers/:id
router.delete('/:id', async (req, res) => {
    try {
        const driver = await Driver.findByIdAndDelete(req.params.id);
        if (!driver) return res.status(404).json({ message: "Driver not found" });
        
        return res.json({ message: "Driver removed successfully" });
    } catch (error) {
        console.error("Delete driver error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// POST /api/admin/drivers/:id/reset-password
router.post('/:id/reset-password', async (req, res) => {
    try {
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
        
        const hashed = await bcrypt.hash(newPassword, 12);
        const driver = await Driver.findByIdAndUpdate(req.params.id, { password: hashed }, { new: true }).select("-password");
        if (!driver) return res.status(404).json({ message: "Driver not found" });
        
        return res.json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
