import express from 'express';
import bcrypt from 'bcryptjs';
import Driver from '../models/Driver.js';
import { signToken } from '../lib/jwt.js';

const router = express.Router();

const RICKSHAW_REGEX = /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/;

// POST /api/auth/driver/login
router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body;
        if (!phone || !password) return res.status(400).json({ message: "Phone and password are required" });
        
        const driver = await Driver.findOne({ phone });
        if (!driver) return res.status(401).json({ message: "Invalid credentials" });
        if (driver.status !== "approved") return res.status(403).json({ message: "Your account is not approved yet. Contact admin." });
        
        const isValid = await bcrypt.compare(password, driver.password);
        if (!isValid) return res.status(401).json({ message: "Invalid credentials" });
        
        const token = signToken({ id: driver._id.toString(), role: "driver", name: driver.name, phone: driver.phone });
        
        res.cookie("auth_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000, path: "/" });
        
        return res.status(200).json({ message: "Login successful", user: { id: driver._id, name: driver.name, phone: driver.phone, rickshawNumber: driver.rickshawNumber, isAvailable: driver.isAvailable, role: "driver" } });
    } catch (error) {
        console.error("Driver login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// POST /api/auth/driver/register
router.post('/register', async (req, res) => {
    try {
        const body = req.body;
        const name = body.name?.trim();
        const phone = body.phone?.trim();
        const email = body.email?.trim().toLowerCase();
        const password = body.password;
        const rickshawNumber = body.rickshawNumber?.trim().toUpperCase();

        if (!name || !phone || !email || !password || !rickshawNumber) {
            return res.status(400).json({ message: "All fields are required." });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: "Please enter a valid email address." });
        }
        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ message: "Phone number must be exactly 10 digits." });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters." });
        }
        if (!RICKSHAW_REGEX.test(rickshawNumber)) {
            return res.status(400).json({ message: "Invalid rickshaw number format. Use format like HR01AB1234." });
        }

        const existingPhone = await Driver.findOne({ phone });
        if (existingPhone) return res.status(409).json({ message: "This phone number is already registered." });

        const existingEmail = await Driver.findOne({ email });
        if (existingEmail) return res.status(409).json({ message: "This email is already registered." });

        const existingRickshaw = await Driver.findOne({ rickshawNumber });
        if (existingRickshaw) return res.status(409).json({ message: "This rickshaw number is already registered." });

        const hashedPassword = await bcrypt.hash(password, 12);

        await Driver.create({
            name, phone, email, password: hashedPassword, rickshawNumber,
            status: "pending", isAvailable: false
        });

        return res.status(201).json({ message: "Registration successful! Your account is pending admin approval. You will be able to login once approved." });

    } catch (error) {
        console.error("Driver registration error:", error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || "field";
            const message = field === "phone" ? "This phone number is already registered." :
                field === "rickshawNumber" ? "This rickshaw number is already registered." :
                    field === "email" ? "This email is already registered." :
                        `A driver with this ${field} already exists.`;
            return res.status(409).json({ message });
        }
        return res.status(500).json({ message: "Internal server error. Please try again." });
    }
});

// Currently, forgot password/reset password for driver is not fully implemented in the original code but the UI links to it. 
// We will omit them for now if they don't exist in Next.js code, or we can add them later.

export default router;
