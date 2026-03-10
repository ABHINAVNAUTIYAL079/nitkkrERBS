import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Otp from "@/models/Otp";

export async function POST(request) {
    try {
        const { email, code } = await request.json();
        if (!email || !code) return NextResponse.json({ message: "Email and OTP code are required" }, { status: 400 });
        await connectDB();
        const otpRecord = await Otp.findOne({ email: email.toLowerCase().trim(), purpose: "driver-reset" });
        if (!otpRecord) return NextResponse.json({ message: "No OTP found. Please request a new one" }, { status: 400 });
        if (new Date() > otpRecord.expiresAt) {
            await Otp.deleteMany({ email: email.toLowerCase().trim(), purpose: "driver-reset" });
            return NextResponse.json({ message: "OTP has expired. Please request a new one" }, { status: 400 });
        }
        if (otpRecord.code !== code.trim()) return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
        await Otp.deleteMany({ email: email.toLowerCase().trim(), purpose: "driver-reset" });
        const response = NextResponse.json({ message: "OTP verified", email });
        response.cookies.set("driver_reset_email", email.toLowerCase().trim(), { httpOnly: true, maxAge: 10 * 60, path: "/", sameSite: "lax" });
        return response;
    } catch (error) {
        console.error("Driver verify OTP error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
