import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import Driver from "@/models/Driver";

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        
        // Normalize and extract fields
        const name = body.name?.trim();
        const phone = body.phone?.trim();
        const password = body.password;
        const rickshawNumber = body.rickshawNumber?.trim().toUpperCase();

        if (!name || !phone || !password || !rickshawNumber) {
            return NextResponse.json({ message: "All fields are required." }, { status: 400 });
        }
        
        if (!/^\d{10}$/.test(phone)) {
            return NextResponse.json({ message: "Phone number must be exactly 10 digits." }, { status: 400 });
        }
        
        if (password.length < 6) {
            return NextResponse.json({ message: "Password must be at least 6 characters." }, { status: 400 });
        }

        // Check for existing phone number
        const existingPhone = await Driver.findOne({ phone });
        if (existingPhone) {
            return NextResponse.json({ message: "This phone number is already registered." }, { status: 409 });
        }

        // Check for existing rickshaw number (with normalized input)
        const existingRickshaw = await Driver.findOne({ rickshawNumber });
        if (existingRickshaw) {
            return NextResponse.json({ message: "This rickshaw number is already registered." }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        
        await Driver.create({
            name,
            phone,
            password: hashedPassword,
            rickshawNumber,
            status: "pending",
            isAvailable: false
        });

        return NextResponse.json({ 
            message: "Registration successful! Your account is pending admin approval. You will be able to login once approved." 
        }, { status: 201 });

    } catch (error) {
        console.error("Driver registration error:", error);
        
        // Handle MongoDB duplicate key errors specifically
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || "field";
            const message = field === "phone" ? "This phone number is already registered." : 
                           field === "rickshawNumber" ? "This rickshaw number is already registered." :
                           `A driver with this ${field} already exists.`;
            return NextResponse.json({ message }, { status: 409 });
        }

        return NextResponse.json({ message: "Internal server error. Please try again." }, { status: 500 });
    }
}
