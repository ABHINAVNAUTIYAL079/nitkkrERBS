import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Driver from "@/models/Driver";
import { comparePassword } from "@/lib/auth";
import { signToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { phone, password } = await req.json();

        if (!phone || !password) {
            return NextResponse.json(
                { message: "Phone and password are required" },
                { status: 400 }
            );
        }

        const driver = await Driver.findOne({ phone });
        if (!driver) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        if (driver.status !== "approved") {
            return NextResponse.json(
                { message: "Your account is not approved yet. Contact admin." },
                { status: 403 }
            );
        }

        const isValid = await comparePassword(password, driver.password);
        if (!isValid) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        const token = signToken({
            id: driver._id.toString(),
            role: "driver",
            name: driver.name,
            phone: driver.phone,
        });

        const response = NextResponse.json({
            message: "Login successful",
            user: {
                id: driver._id,
                name: driver.name,
                phone: driver.phone,
                rickshawNumber: driver.rickshawNumber,
                isAvailable: driver.isAvailable,
                role: "driver",
            },
        });

        response.cookies.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Driver login error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
