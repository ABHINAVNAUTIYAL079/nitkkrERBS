import express from 'express';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import { signToken } from '../lib/jwt.js';

const router = express.Router();

const DEFAULT_ADMIN = { name: "NIT KKR Admin", email: "admin@nitkkr.ac.in", password: "admin123", role: "admin" };

// POST /api/auth/admin/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
        
        const adminCount = await Admin.countDocuments();
        if (adminCount === 0) {
            const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 12);
            await Admin.create({ name: DEFAULT_ADMIN.name, email: DEFAULT_ADMIN.email, password: hashedPassword, role: DEFAULT_ADMIN.role });
            console.log("✅ Default admin account auto-created");
        }
        
        const admin = await Admin.findOne({ email: email.toLowerCase() });
        if (!admin) return res.status(401).json({ message: "Invalid credentials" });
        
        const isValid = await bcrypt.compare(password, admin.password);
        if (!isValid) return res.status(401).json({ message: "Invalid credentials" });
        
        const token = signToken({ id: admin._id.toString(), role: "admin", name: admin.name, email: admin.email });
        
        res.cookie("auth_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000, path: "/" });
        
        return res.status(200).json({ message: "Login successful", user: { id: admin._id, name: admin.name, email: admin.email, role: "admin" } });
    } catch (error) {
        console.error("Admin login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
