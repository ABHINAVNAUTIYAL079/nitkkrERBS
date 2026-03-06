import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Otp from "@/models/Otp";
import { signToken } from "@/lib/jwt";

export async function POST(request) {
    try {
        const { email, code, purpose } = await request.json();
        if (!email || !code || !purpose) return NextResponse.json({ message: "Email, OTP code and purpose are required" }, { status: 400 });
        await connectDB();
        const otpRecord = await Otp.findOne({ email, purpose });
        if (!otpRecord) return NextResponse.json({ message: "No OTP found. Please request a new one" }, { status: 400 });
        if (new Date() > otpRecord.expiresAt) {
            await Otp.deleteMany({ email, purpose });
            return NextResponse.json({ message: "OTP has expired. Please request a new one" }, { status: 400 });
        }
        if (otpRecord.code !== code.trim()) return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
        await Otp.deleteMany({ email, purpose });
        if (purpose === "register") {
            const pending = otpRecord.pendingUser;
            if (!pending) return NextResponse.json({ message: "Registration data missing. Please register again" }, { status: 400 });
            const existing = await User.findOne({ $or: [{ phone: pending.phone }, { email: pending.email }] });
            if (existing) return NextResponse.json({ message: "This phone or email was already registered" }, { status: 409 });
            const user = await User.create({ name: pending.name, phone: pending.phone, email: pending.email, password: pending.password, isVerified: true, role: "user" });
            const token = signToken({ id: user._id.toString(), role: "user", name: user.name, phone: user.phone });
            const response = NextResponse.json({ message: "Account created successfully!", user: { name: user.name, phone: user.phone, email: user.email } });
            response.cookies.set("auth_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 24 * 60 * 60, path: "/" });
            return response;
        }
        const response = NextResponse.json({ message: "OTP verified", email });
        response.cookies.set("reset_email", email, { httpOnly: true, maxAge: 10 * 60, path: "/", sameSite: "lax" });
        return response;
    } catch (error) {
        console.error("Verify OTP error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
