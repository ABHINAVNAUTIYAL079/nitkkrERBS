import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import { sendOtpEmail } from '../lib/email.js';
import { signToken } from '../lib/jwt.js';

const router = express.Router();

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/user/login
router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body;
        if (!phone || !password) return res.status(400).json({ message: "Phone and password are required" });
        
        const user = await User.findOne({ phone });
        if (!user) return res.status(404).json({ message: "No account found with this phone number" });
        if (!user.isVerified) return res.status(403).json({ message: "Account not verified. Please complete registration" });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Incorrect password" });
        
        const token = signToken({ id: user._id.toString(), role: "user", name: user.name, phone: user.phone });
        
        res.cookie("auth_token", token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production", 
            sameSite: "lax", 
            maxAge: 7 * 24 * 60 * 60 * 1000, // maxAge is in milliseconds for Express cookie
            path: "/" 
        });
        
        return res.status(200).json({ message: "Login successful", user: { name: user.name, phone: user.phone, email: user.email } });
    } catch (error) {
        console.error("User login error:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

// POST /api/auth/user/register
router.post('/register', async (req, res) => {
    try {
        const { name, phone, email, password } = req.body;
        if (!name || !phone || !email || !password) return res.status(400).json({ message: "All fields are required" });
        if (!/^\d{10}$/.test(phone)) return res.status(400).json({ message: "Phone must be 10 digits" });
        if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });
        
        const existing = await User.findOne({ $or: [{ phone }, { email }] });
        if (existing) {
            const field = existing.phone === phone ? "Phone number" : "Email";
            return res.status(409).json({ message: `${field} is already registered` });
        }
        
        const hashedPassword = await bcrypt.hash(password, 12);
        const code = generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        
        await Otp.deleteMany({ email, purpose: "register" });
        await Otp.create({ email, code, purpose: "register", expiresAt, pendingUser: { name, phone, email, password: hashedPassword } });
        
        const emailSent = await sendOtpEmail(email, code);
        return res.status(200).json({
            message: emailSent ? "OTP sent to your email address" : "OTP generated — email delivery failed, use the code shown below",
            devOtp: emailSent ? undefined : code,
        });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

// POST /api/auth/user/verify-otp
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, code, purpose } = req.body;
        if (!email || !code || !purpose) return res.status(400).json({ message: "Email, OTP code and purpose are required" });
        
        const otpRecord = await Otp.findOne({ email, purpose });
        if (!otpRecord) return res.status(400).json({ message: "No OTP found. Please request a new one" });
        if (new Date() > otpRecord.expiresAt) {
            await Otp.deleteMany({ email, purpose });
            return res.status(400).json({ message: "OTP has expired. Please request a new one" });
        }
        if (otpRecord.code !== code.trim()) return res.status(400).json({ message: "Invalid OTP" });
        
        await Otp.deleteMany({ email, purpose });
        
        if (purpose === "register") {
            const pending = otpRecord.pendingUser;
            if (!pending) return res.status(400).json({ message: "Registration data missing. Please register again" });
            
            const existing = await User.findOne({ $or: [{ phone: pending.phone }, { email: pending.email }] });
            if (existing) return res.status(409).json({ message: "This phone or email was already registered" });
            
            const user = await User.create({ name: pending.name, phone: pending.phone, email: pending.email, password: pending.password, isVerified: true, role: "user" });
            const token = signToken({ id: user._id.toString(), role: "user", name: user.name, phone: user.phone });
            
            res.cookie("auth_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000, path: "/" });
            return res.status(200).json({ message: "Account created successfully!", user: { name: user.name, phone: user.phone, email: user.email } });
        }
        
        res.cookie("reset_email", email, { httpOnly: true, maxAge: 10 * 60 * 1000, path: "/", sameSite: "lax" });
        return res.status(200).json({ message: "OTP verified", email });
    } catch (error) {
        console.error("Verify OTP error:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

// POST /api/auth/user/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });
        
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "No account found with this email" });
        
        const code = generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        
        await Otp.deleteMany({ email, purpose: "reset" });
        await Otp.create({ email, code, purpose: "reset", expiresAt });
        
        const emailSent = await sendOtpEmail(email, code);
        return res.status(200).json({
            message: emailSent ? "OTP sent to your email" : "OTP generated — email delivery failed, use the code shown below",
            devOtp: emailSent ? undefined : code,
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

// POST /api/auth/user/reset-password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) return res.status(400).json({ message: "Email and new password are required" });
        if (newPassword.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });
        
        const resetEmail = req.cookies.reset_email;
        if (!resetEmail || resetEmail !== email) return res.status(403).json({ message: "Reset session expired. Please start again" });
        
        const hashed = await bcrypt.hash(newPassword, 12);
        const user = await User.findOneAndUpdate({ email }, { password: hashed }, { new: true });
        
        if (!user) return res.status(404).json({ message: "User not found" });
        
        res.clearCookie("reset_email", { path: "/" });
        return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

export default router;
