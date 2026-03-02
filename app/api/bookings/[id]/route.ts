import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import Driver from "@/models/Driver";
import { getUserFromRequest } from "@/lib/getUser";

// PATCH /api/bookings/[id] - Update booking status
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const user = getUserFromRequest(req);

        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { status, notes } = await req.json();
        const booking = await Booking.findById(params.id);

        if (!booking) {
            return NextResponse.json({ message: "Booking not found" }, { status: 404 });
        }

        const validTransitions: Record<string, string[]> = {
            pending: ["accepted", "cancelled"],
            accepted: ["on_the_way", "cancelled"],
            on_the_way: ["completed"],
            completed: [],
            cancelled: [],
        };

        const allowed = validTransitions[booking.status] || [];
        if (!allowed.includes(status)) {
            return NextResponse.json(
                {
                    message: `Cannot transition from '${booking.status}' to '${status}'`,
                },
                { status: 400 }
            );
        }

        // Driver accepting/updating a booking
        if (user.role === "driver") {
            if (status === "accepted") {
                // Check driver is available and approved
                const driver = await Driver.findById(user.id);
                if (!driver || !driver.isAvailable) {
                    return NextResponse.json(
                        { message: "You must be available to accept bookings" },
                        { status: 400 }
                    );
                }
                booking.driverId = driver._id;
                booking.driverName = driver.name;
                // Mark driver as busy
                await Driver.findByIdAndUpdate(user.id, { isAvailable: false });
            }
            if (status === "completed") {
                // Free the driver
                await Driver.findByIdAndUpdate(user.id, { isAvailable: true });
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

// GET /api/bookings/[id] - Get single booking
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const booking = await Booking.findById(params.id).lean();
        if (!booking) {
            return NextResponse.json({ message: "Booking not found" }, { status: 404 });
        }
        return NextResponse.json({ booking });
    } catch (error) {
        console.error("Get booking error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
