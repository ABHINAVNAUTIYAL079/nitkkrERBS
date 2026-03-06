import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Location from "@/models/Location";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await dbConnect();
        const locations = await Location.find({ isActive: true }).select("name description").sort({ name: 1 });
        return NextResponse.json({ locations });
    } catch (error) {
        console.error("Locations error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
