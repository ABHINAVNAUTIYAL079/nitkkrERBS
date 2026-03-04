import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import Driver from "@/models/Driver";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const { name, phone, password, rickshawNumber } =
            await req.json();

        // Validate required fields
        if (!name || !phone || !password || !rickshawNumber) {
            return NextResponse.json(
                { message: "All fields are required." },
                { status: 400 }
            );
        }

        // Validate phone number (10 digits)
        if (!/^\d{10}$/.test(phone)) {
            return NextResponse.json(
                { message: "Phone number must be exactly 10 digits." },
                { status: 400 }
            );
        }

        // Validate password length
        if (password.length < 6) {
            return NextResponse.json(
                { message: "Password must be at least 6 characters." },
                { status: 400 }
            );
        }

        // Check if phone already registered
        const existingPhone = await Driver.findOne({ phone });
        if (existingPhone) {
            return NextResponse.json(
                { message: "This phone number is already registered." },
                { status: 409 }
            );
        }

        // Check if rickshaw number already registered
        const existingRickshaw = await Driver.findOne({ rickshawNumber });
        if (existingRickshaw) {
            return NextResponse.json(
                { message: "This rickshaw number is already registered." },
                { status: 409 }
            );
        }



        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create driver (status: pending by default)
        await Driver.create({
            name: name.trim(),
            phone,
            password: hashedPassword,
            rickshawNumber: rickshawNumber.trim().toUpperCase(),

            status: "pending",
            isAvailable: false,
        });

        return NextResponse.json(
            {
                message:
                    "Registration successful! Your account is pending admin approval. You will be able to login once approved.",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Driver registration error:", error instanceof Error ? error.message : error);
        if (error instanceof Error) console.error(error.stack);
        return NextResponse.json(
            { message: "Internal server error. Please try again." },
            { status: 500 }
        );
    }
}
