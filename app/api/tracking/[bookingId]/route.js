import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import { getDistance } from "@/lib/distance";

export const dynamic = "force-dynamic";

// POST — Update driver or user location
export async function POST(req, { params }) {
    try {
        await dbConnect();
        const { lat, lng, role } = await req.json();
        const bookingId = params.bookingId;

        if (!lat || !lng || !role) {
            return NextResponse.json({ message: "lat, lng, and role are required" }, { status: 400 });
        }

        if (!["driver", "user"].includes(role)) {
            return NextResponse.json({ message: "role must be 'driver' or 'user'" }, { status: 400 });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return NextResponse.json({ message: "Booking not found" }, { status: 404 });
        }

        // Only allow tracking for active rides
        if (!["accepted", "on_the_way"].includes(booking.status)) {
            return NextResponse.json({ message: "Tracking only available for active rides" }, { status: 400 });
        }

        const locationField = role === "driver" ? "driverLocation" : "userLocation";
        booking[locationField] = { lat, lng, updatedAt: new Date() };
        await booking.save();

        return NextResponse.json({ message: "Location updated" });
    } catch (error) {
        console.error("Update location error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// GET — Get both locations + distance
export async function GET(req, { params }) {
    try {
        await dbConnect();
        const booking = await Booking.findById(params.bookingId)
            .select("driverLocation userLocation status driverName bookingId")
            .lean();

        if (!booking) {
            return NextResponse.json({ message: "Booking not found" }, { status: 404 });
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

        return NextResponse.json({
            driverLocation: booking.driverLocation,
            userLocation: booking.userLocation,
            distance,
            status: booking.status,
            driverName: booking.driverName,
            bookingId: booking.bookingId,
        });
    } catch (error) {
        console.error("Get tracking error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
