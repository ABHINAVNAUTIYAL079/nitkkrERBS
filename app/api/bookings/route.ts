import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import { getUserFromRequest } from "@/lib/getUser";

function generateBookingId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ERK-${timestamp}-${random}`;
}

// POST /api/bookings - Create a new booking (public, no auth needed)
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { studentName, phone, pickupLocation, dropLocation, distanceKm, fareAmount } = await req.json();

        if (!studentName || !phone || !pickupLocation || !dropLocation) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            );
        }

        if (pickupLocation === dropLocation) {
            return NextResponse.json(
                { message: "Pickup and drop locations must be different" },
                { status: 400 }
            );
        }

        // Validate phone
        if (!/^\d{10}$/.test(phone)) {
            return NextResponse.json(
                { message: "Please enter a valid 10-digit phone number" },
                { status: 400 }
            );
        }

        const booking = await Booking.create({
            bookingId: generateBookingId(),
            studentName: studentName.trim(),
            phone,
            pickupLocation,
            dropLocation,
            status: "pending",
            distanceKm: distanceKm ?? null,
            fareAmount: fareAmount ?? null,
        });

        return NextResponse.json(
            {
                message: "Booking created successfully",
                booking: {
                    id: booking._id,
                    bookingId: booking.bookingId,
                    studentName: booking.studentName,
                    phone: booking.phone,
                    pickupLocation: booking.pickupLocation,
                    dropLocation: booking.dropLocation,
                    status: booking.status,
                    distanceKm: booking.distanceKm,
                    fareAmount: booking.fareAmount,
                    createdAt: booking.createdAt,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create booking error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// GET /api/bookings - Get bookings
// - Admin: all bookings
// - Public: by phone query param
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const user = getUserFromRequest(req);
        const { searchParams } = new URL(req.url);
        const phone = searchParams.get("phone");
        const status = searchParams.get("status");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = 20;

        // Admin can see all bookings
        if (user?.role === "admin") {
            const query: Record<string, unknown> = {};
            if (status) query.status = status;
            if (phone) query.phone = phone;

            const total = await Booking.countDocuments(query);
            const bookings = await Booking.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();

            return NextResponse.json({ bookings, total, page, totalPages: Math.ceil(total / limit) });
        }

        // Public: lookup by phone number
        if (!phone) {
            return NextResponse.json(
                { message: "Phone number is required" },
                { status: 400 }
            );
        }

        const bookings = await Booking.find({ phone })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        return NextResponse.json({ bookings });
    } catch (error) {
        console.error("Get bookings error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
