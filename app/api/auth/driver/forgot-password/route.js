import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Driver from "@/models/Driver";
import Otp from "@/models/Otp";
import { sendOtpEmail } from "@/lib/email";

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
    try {
        const { email } = await request.json();
        if (!email) return NextResponse.json({ message: "Email is required" }, { status: 400 });
        await connectDB();
        const driver = await Driver.findOne({ email: email.toLowerCase().trim() });
        if (!driver) return NextResponse.json({ message: "No driver account found with this email" }, { status: 404 });
        const code = generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await Otp.deleteMany({ email: email.toLowerCase().trim(), purpose: "driver-reset" });
        await Otp.create({ email: email.toLowerCase().trim(), code, purpose: "driver-reset", expiresAt });
        const emailSent = await sendOtpEmail(email, code);
        return NextResponse.json({
            message: emailSent ? "OTP sent to your email" : "OTP generated — email delivery failed, use the code shown below",
            devOtp: emailSent ? undefined : code,
        });
    } catch (error) {
        console.error("Driver forgot password error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
