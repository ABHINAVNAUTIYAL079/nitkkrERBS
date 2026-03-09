import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import Driver from "@/models/Driver";
import { getUserFromRequest } from "@/lib/getUser";

export const dynamic = "force-dynamic";

// POST — Driver submits OTP to verify ride start
export async function POST(req, { params }) {
    try {
        await dbConnect();
        const user = getUserFromRequest(req);
        if (!user || user.role !== "driver") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { otp } = await req.json();
        if (!otp) {
            return NextResponse.json({ message: "OTP is required" }, { status: 400 });
        }

        const booking = await Booking.findById(params.id);
        if (!booking) {
            return NextResponse.json({ message: "Booking not found" }, { status: 404 });
        }

        if (booking.status !== "accepted") {
            return NextResponse.json({ message: "OTP verification is only available for accepted rides" }, { status: 400 });
        }

        if (booking.driverId?.toString() !== user.id) {
            return NextResponse.json({ message: "This ride is not assigned to you" }, { status: 403 });
        }

        if (booking.rideOtp !== otp.trim()) {
            return NextResponse.json({ message: "Invalid OTP. Please try again." }, { status: 400 });
        }

        // OTP verified — transition to on_the_way
        booking.rideOtpVerified = true;
        booking.status = "on_the_way";
        await booking.save();

        return NextResponse.json({
            message: "OTP verified! Ride started.",
            booking: { _id: booking._id, status: booking.status, rideOtpVerified: true },
        });
    } catch (error) {
        console.error("Verify OTP error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
