import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Driver from "@/models/Driver";
import bcrypt from "bcryptjs";

export async function POST(request) {
    try {
        const { email, newPassword } = await request.json();
        if (!email || !newPassword) return NextResponse.json({ message: "Email and new password are required" }, { status: 400 });
        if (newPassword.length < 6) return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
        const resetEmail = request.cookies.get("driver_reset_email")?.value;
        if (!resetEmail || resetEmail !== email.toLowerCase().trim()) return NextResponse.json({ message: "Reset session expired. Please start again" }, { status: 403 });
        await connectDB();
        const hashed = await bcrypt.hash(newPassword, 12);
        const driver = await Driver.findOneAndUpdate({ email: email.toLowerCase().trim() }, { password: hashed }, { new: true });
        if (!driver) return NextResponse.json({ message: "Driver not found" }, { status: 404 });
        const response = NextResponse.json({ message: "Password reset successfully" });
        response.cookies.set("driver_reset_email", "", { maxAge: 0, path: "/" });
        return response;
    } catch (error) {
        console.error("Driver reset password error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
