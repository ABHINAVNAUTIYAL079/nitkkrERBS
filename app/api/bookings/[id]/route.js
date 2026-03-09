import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import Driver from "@/models/Driver";
import User from "@/models/User";
import { getUserFromRequest } from "@/lib/getUser";
import { sendOtpEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
    try {
        await dbConnect();
        const user = getUserFromRequest(req);
        if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        const { status, notes } = await req.json();
        const booking = await Booking.findById(params.id);
        if (!booking) return NextResponse.json({ message: "Booking not found" }, { status: 404 });
        const validTransitions = {
            pending: ["accepted", "cancelled"],
            accepted: ["cancelled"],
            on_the_way: ["completed"],
            completed: [],
            cancelled: [],
        };
        const allowed = validTransitions[booking.status] || [];
        if (!allowed.includes(status)) return NextResponse.json({ message: `Cannot transition from '${booking.status}' to '${status}'` }, { status: 400 });
        if (user.role === "driver") {
            if (status === "accepted") {
                const driver = await Driver.findById(user.id);
                if (!driver || !driver.isAvailable) return NextResponse.json({ message: "You must be available to accept bookings" }, { status: 400 });
                booking.driverId = driver._id;
                booking.driverName = driver.name;
                await Driver.findByIdAndUpdate(user.id, { isAvailable: false });

                // Generate 4-digit ride OTP
                const rideOtp = String(Math.floor(1000 + Math.random() * 9000));
                booking.rideOtp = rideOtp;
                booking.rideOtpVerified = false;

                // Try to email OTP to the user
                const studentUser = await User.findOne({ phone: booking.phone });
                if (studentUser?.email) {
                    sendOtpEmail(studentUser.email, rideOtp).catch((err) =>
                        console.error("Failed to send ride OTP email:", err)
                    );
                }
            }
            if (status === "completed") {
                await Driver.findByIdAndUpdate(user.id, { isAvailable: true });
                // Clear tracking data
                booking.driverLocation = { lat: null, lng: null, updatedAt: null };
                booking.userLocation = { lat: null, lng: null, updatedAt: null };
            }
        }
        booking.status = status;
        if (notes) booking.notes = notes;
        await booking.save();
        return NextResponse.json({ message: "Booking updated", booking });
    } catch (error) {
        console.error("Update booking error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const booking = await Booking.findById(params.id).lean();
        if (!booking) return NextResponse.json({ message: "Booking not found" }, { status: 404 });
        return NextResponse.json({ booking });
    } catch (error) {
        console.error("Get booking error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
