import express from 'express';
import { getUserFromRequest } from '../middleware/auth.js';

const router = express.Router();

// GET /api/auth/me
router.get('/me', (req, res) => {
    const user = getUserFromRequest(req);
    if (!user) return res.status(401).json({ message: "Not authenticated" });
    return res.status(200).json({ user });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    res.cookie("auth_token", "", { httpOnly: true, expires: new Date(0), path: "/" });
    return res.status(200).json({ message: "Logged out successfully" });
});

export default router;
