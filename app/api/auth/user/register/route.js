import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Otp from "@/models/Otp";
import bcrypt from "bcryptjs";
import { sendOtpEmail } from "@/lib/email";

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
    try {
        const { name, phone, email, password } = await request.json();
        if (!name || !phone || !email || !password) return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        if (!/^\d{10}$/.test(phone)) return NextResponse.json({ message: "Phone must be 10 digits" }, { status: 400 });
        if (password.length < 8) return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 });
        await connectDB();
        const existing = await User.findOne({ $or: [{ phone }, { email }] });
        if (existing) {
            const field = existing.phone === phone ? "Phone number" : "Email";
            return NextResponse.json({ message: `${field} is already registered` }, { status: 409 });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const code = generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await Otp.deleteMany({ email, purpose: "register" });
        await Otp.create({ email, code, purpose: "register", expiresAt, pendingUser: { name, phone, email, password: hashedPassword } });
        const emailSent = await sendOtpEmail(email, code);
        return NextResponse.json({
            message: emailSent ? "OTP sent to your email address" : "OTP generated — email delivery failed, use the code shown below",
            devOtp: emailSent ? undefined : code,
        });
    } catch (error) {
        console.error("Register error:", error instanceof Error ? error.message : error);
        if (error instanceof Error) console.error(error.stack);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
