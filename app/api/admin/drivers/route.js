import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Driver from "@/models/Driver";
import { hashPassword } from "@/lib/auth";
import { getUserFromRequest } from "@/lib/getUser";

const RICKSHAW_REGEX = /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/;

export const dynamic = "force-dynamic";

export async function GET(req) {
    try {
        await dbConnect();
        const user = getUserFromRequest(req);
        if (!user || user.role !== "admin") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        const drivers = await Driver.find().select("-password").sort({ createdAt: -1 }).lean();
        return NextResponse.json({ drivers });
    } catch (error) {
        console.error("Get drivers error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const user = getUserFromRequest(req);
        if (!user || user.role !== "admin") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        const { name, phone, password, rickshawNumber } = await req.json();
        if (!name || !phone || !password || !rickshawNumber) return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        const normalizedRickshaw = rickshawNumber.trim().toUpperCase();
        if (!RICKSHAW_REGEX.test(normalizedRickshaw)) {
            return NextResponse.json({ message: "Invalid rickshaw number format. Use format like HR01AB1234" }, { status: 400 });
        }
        const existing = await Driver.findOne({ $or: [{ phone }, { rickshawNumber: normalizedRickshaw }] });
        if (existing) return NextResponse.json({ message: "Driver with same phone or rickshaw number already exists" }, { status: 409 });
        const hashedPassword = await hashPassword(password);
        const driver = await Driver.create({ name: name.trim(), phone, password: hashedPassword, rickshawNumber: normalizedRickshaw, email: `${phone}@placeholder.local`, status: "pending" });
        return NextResponse.json({ message: "Driver added successfully", driver: { id: driver._id, name: driver.name, phone: driver.phone, rickshawNumber: driver.rickshawNumber, status: driver.status } }, { status: 201 });
    } catch (error) {
        console.error("Add driver error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
