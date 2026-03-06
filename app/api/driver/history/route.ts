import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import { getUserFromRequest } from "@/lib/getUser";

export const dynamic = "force-dynamic";

// GET /api/driver/history - Get all past rides for the logged-in driver
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const user = getUserFromRequest(req);
        if (!user || user.role !== "driver") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Fetch bookings assigned to this driver that are completed or cancelled
        const bookings = await Booking.find({
            driverId: user.id,
            status: { $in: ["completed", "cancelled", "on_the_way", "accepted"] },
        })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ bookings });
    } catch (error) {
        console.error("Driver history error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
