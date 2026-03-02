import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
    try {
        const { email, newPassword } = await request.json();

        if (!email || !newPassword) {
            return NextResponse.json({ message: "Email and new password are required" }, { status: 400 });
        }
        if (newPassword.length < 8) {
            return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 });
        }

        // Verify the reset_email cookie matches
        const resetEmail = request.cookies.get("reset_email")?.value;
        if (!resetEmail || resetEmail !== email) {
            return NextResponse.json({ message: "Reset session expired. Please start again" }, { status: 403 });
        }

        await connectDB();

        const hashed = await bcrypt.hash(newPassword, 12);
        const user = await User.findOneAndUpdate({ email }, { password: hashed }, { new: true });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const response = NextResponse.json({ message: "Password reset successfully" });
        // Clear the reset cookie
        response.cookies.set("reset_email", "", { maxAge: 0, path: "/" });
        return response;
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
