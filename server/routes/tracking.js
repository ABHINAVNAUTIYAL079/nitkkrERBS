import express from 'express';
import Booking from '../models/Booking.js';
import { getDistance } from '../lib/distance.js';

const router = express.Router();

// POST /api/tracking/:bookingId
router.post('/:bookingId', async (req, res) => {
    try {
        const { lat, lng, role } = req.body;
        const bookingId = req.params.bookingId;

        if (!lat || !lng || !role) {
            return res.status(400).json({ message: "lat, lng, and role are required" });
        }

        if (!["driver", "user"].includes(role)) {
            return res.status(400).json({ message: "role must be 'driver' or 'user'" });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (!["accepted", "on_the_way"].includes(booking.status)) {
            return res.status(400).json({ message: "Tracking only available for active rides" });
        }

        const locationField = role === "driver" ? "driverLocation" : "userLocation";
        booking[locationField] = { lat, lng, updatedAt: new Date() };
        await booking.save();

        return res.json({ message: "Location updated" });
    } catch (error) {
        console.error("Update location error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// GET /api/tracking/:bookingId
router.get('/:bookingId', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId)
            .select("driverLocation userLocation status driverName bookingId")
            .lean();

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        let distance = null;
        if (
            booking.driverLocation?.lat &&
            booking.driverLocation?.lng &&
            booking.userLocation?.lat &&
            booking.userLocation?.lng
        ) {
            distance = getDistance(
                booking.driverLocation.lat,
                booking.driverLocation.lng,
                booking.userLocation.lat,
                booking.userLocation.lng
            );
        }

        return res.json({
            driverLocation: booking.driverLocation,
            userLocation: booking.userLocation,
            distance,
            status: booking.status,
            driverName: booking.driverName,
            bookingId: booking.bookingId,
        });
    } catch (error) {
        console.error("Get tracking error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
