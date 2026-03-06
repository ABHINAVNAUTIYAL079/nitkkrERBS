import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import { getUserFromRequest } from "@/lib/getUser";

export const dynamic = "force-dynamic";

// GET /api/bookings/pending - Pending bookings for driver dashboard
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const user = getUserFromRequest(req);

        if (!user || user.role !== "driver") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const bookings = await Booking.find({ status: "pending" })
            .sort({ createdAt: 1 })
            .lean();

        return NextResponse.json({ bookings });
    } catch (error) {
        console.error("Pending bookings error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
