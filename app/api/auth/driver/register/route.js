import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import Driver from "@/models/Driver";

export async function POST(req) {
    try {
        await connectDB();
        const { name, phone, password, rickshawNumber } = await req.json();
        if (!name || !phone || !password || !rickshawNumber) return NextResponse.json({ message: "All fields are required." }, { status: 400 });
        if (!/^\d{10}$/.test(phone)) return NextResponse.json({ message: "Phone number must be exactly 10 digits." }, { status: 400 });
        if (password.length < 6) return NextResponse.json({ message: "Password must be at least 6 characters." }, { status: 400 });
        const existingPhone = await Driver.findOne({ phone });
        if (existingPhone) return NextResponse.json({ message: "This phone number is already registered." }, { status: 409 });
        const existingRickshaw = await Driver.findOne({ rickshawNumber });
        if (existingRickshaw) return NextResponse.json({ message: "This rickshaw number is already registered." }, { status: 409 });
        const hashedPassword = await bcrypt.hash(password, 12);
        await Driver.create({ name: name.trim(), phone, password: hashedPassword, rickshawNumber: rickshawNumber.trim().toUpperCase(), status: "pending", isAvailable: false });
        return NextResponse.json({ message: "Registration successful! Your account is pending admin approval. You will be able to login once approved." }, { status: 201 });
    } catch (error) {
        console.error("Driver registration error:", error instanceof Error ? error.message : error);
        if (error instanceof Error) console.error(error.stack);
        return NextResponse.json({ message: "Internal server error. Please try again." }, { status: 500 });
    }
}
