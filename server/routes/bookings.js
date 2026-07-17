import express from 'express';
import Booking from '../models/Booking.js';
import Driver from '../models/Driver.js';
import User from '../models/User.js';
import { getUserFromRequest } from '../middleware/auth.js';
import { sendOtpEmail } from '../lib/email.js';

const router = express.Router();

function generateBookingId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ERK-${timestamp}-${random}`;
}

// POST /api/bookings
router.post('/', async (req, res) => {
    try {
        const { studentName, phone, pickupLocation, dropLocation, distanceKm, fareAmount, rideType, nightSurcharge } = req.body;
        if (!studentName || !phone || !pickupLocation || !dropLocation) return res.status(400).json({ message: "All fields are required" });
        if (pickupLocation === dropLocation) return res.status(400).json({ message: "Pickup and drop locations must be different" });
        if (!/^\d{10}$/.test(phone)) return res.status(400).json({ message: "Please enter a valid 10-digit phone number" });
        
        const booking = await Booking.create({
            bookingId: generateBookingId(), studentName: studentName.trim(), phone, pickupLocation, dropLocation,
            status: "pending", distanceKm: distanceKm ?? null, fareAmount: fareAmount ?? null, rideType: rideType ?? null, nightSurcharge: nightSurcharge ?? 0,
        });
        
        return res.status(201).json({ message: "Booking created successfully", booking: { id: booking._id, bookingId: booking.bookingId, studentName: booking.studentName, phone: booking.phone, pickupLocation: booking.pickupLocation, dropLocation: booking.dropLocation, status: booking.status, distanceKm: booking.distanceKm, fareAmount: booking.fareAmount, createdAt: booking.createdAt } });
    } catch (error) {
        console.error("Create booking error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// GET /api/bookings
router.get('/', async (req, res) => {
    try {
        const user = getUserFromRequest(req);
        const { phone, status, page = "1" } = req.query;
        const limit = 20;
        
        if (user?.role === "admin") {
            const query = {};
            if (status) query.status = status;
            if (phone) query.phone = phone;
            const total = await Booking.countDocuments(query);
            const bookings = await Booking.find(query).sort({ createdAt: -1 }).skip((parseInt(page) - 1) * limit).limit(limit).lean();
            return res.json({ bookings, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
        }
        
        if (!phone) return res.status(400).json({ message: "Phone number is required" });
        const bookings = await Booking.find({ phone }).sort({ createdAt: -1 }).limit(20).lean();
        return res.json({ bookings });
    } catch (error) {
        console.error("Get bookings error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// GET /api/bookings/pending
router.get('/pending', async (req, res) => {
    try {
        const user = getUserFromRequest(req);
        if (!user || user.role !== "driver") return res.status(401).json({ message: "Unauthorized" });
        
        const bookings = await Booking.find({ status: "pending" }).sort({ createdAt: 1 }).lean();
        return res.json({ bookings });
    } catch (error) {
        console.error("Pending bookings error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// GET /api/bookings/:id
router.get('/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).lean();
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        return res.json({ booking });
    } catch (error) {
        console.error("Get booking error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// PATCH /api/bookings/:id
router.patch('/:id', async (req, res) => {
    try {
        const user = getUserFromRequest(req);
        if (!user) return res.status(401).json({ message: "Unauthorized" });
        
        const { status, notes } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        
        const validTransitions = {
            pending: ["accepted", "cancelled"],
            accepted: ["cancelled"],
            on_the_way: ["completed"],
            completed: [],
            cancelled: [],
        };
        
        const allowed = validTransitions[booking.status] || [];
        if (!allowed.includes(status)) return res.status(400).json({ message: `Cannot transition from '${booking.status}' to '${status}'` });
        
        if (user.role === "driver") {
            if (status === "accepted") {
                const driver = await Driver.findById(user.id);
                if (!driver || !driver.isAvailable) return res.status(400).json({ message: "You must be available to accept bookings" });
                
                booking.driverId = driver._id;
                booking.driverName = driver.name;
                await Driver.findByIdAndUpdate(user.id, { isAvailable: false });

                const rideOtp = String(Math.floor(1000 + Math.random() * 9000));
                booking.rideOtp = rideOtp;
                booking.rideOtpVerified = false;

                const studentUser = await User.findOne({ phone: booking.phone });
                if (studentUser?.email) {
                    sendOtpEmail(studentUser.email, rideOtp).catch((err) => console.error("Failed to send ride OTP email:", err));
                }
            }
            if (status === "completed") {
                await Driver.findByIdAndUpdate(user.id, { isAvailable: true });
                booking.driverLocation = { lat: null, lng: null, updatedAt: null };
                booking.userLocation = { lat: null, lng: null, updatedAt: null };
            }
        }
        
        booking.status = status;
        if (notes) booking.notes = notes;
        await booking.save();
        
        return res.json({ message: "Booking updated", booking });
    } catch (error) {
        console.error("Update booking error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// POST /api/bookings/:id/verify-otp
router.post('/:id/verify-otp', async (req, res) => {
    try {
        const user = getUserFromRequest(req);
        if (!user || user.role !== "driver") return res.status(401).json({ message: "Unauthorized" });

        const { otp } = req.body;
        if (!otp) return res.status(400).json({ message: "OTP is required" });

        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        if (booking.status !== "accepted") return res.status(400).json({ message: "OTP verification is only available for accepted rides" });
        if (booking.driverId?.toString() !== user.id) return res.status(403).json({ message: "This ride is not assigned to you" });
        if (booking.rideOtp !== otp.trim()) return res.status(400).json({ message: "Invalid OTP. Please try again." });

        booking.rideOtpVerified = true;
        booking.status = "on_the_way";
        await booking.save();

        return res.json({
            message: "OTP verified! Ride started.",
            booking: { _id: booking._id, status: booking.status, rideOtpVerified: true },
        });
    } catch (error) {
        console.error("Verify OTP error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
