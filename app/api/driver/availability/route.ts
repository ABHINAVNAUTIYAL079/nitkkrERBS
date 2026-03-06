import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Driver from "@/models/Driver";
import { getUserFromRequest } from "@/lib/getUser";

export const dynamic = "force-dynamic";

// PATCH /api/driver/availability - Toggle driver availability
export async function PATCH(req: NextRequest) {
    try {
        await dbConnect();
        const user = getUserFromRequest(req);
        if (!user || user.role !== "driver") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const driver = await Driver.findById(user.id);
        if (!driver) {
            return NextResponse.json({ message: "Driver not found" }, { status: 404 });
        }

        driver.isAvailable = !driver.isAvailable;
        await driver.save();

        return NextResponse.json({
            message: `You are now ${driver.isAvailable ? "available" : "busy"}`,
            isAvailable: driver.isAvailable,
        });
    } catch (error) {
        console.error("Availability toggle error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// GET /api/driver/availability - Get driver info
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const user = getUserFromRequest(req);
        if (!user || user.role !== "driver") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const driver = await Driver.findById(user.id).select("-password");
        if (!driver) {
            return NextResponse.json({ message: "Driver not found" }, { status: 404 });
        }

        return NextResponse.json({ driver });
    } catch (error) {
        console.error("Driver info error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
