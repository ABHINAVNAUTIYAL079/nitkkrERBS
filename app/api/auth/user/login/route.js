import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";

export async function POST(request) {
    try {
        const { phone, password } = await request.json();
        if (!phone || !password) return NextResponse.json({ message: "Phone and password are required" }, { status: 400 });
        await connectDB();
        const user = await User.findOne({ phone });
        if (!user) return NextResponse.json({ message: "No account found with this phone number" }, { status: 404 });
        if (!user.isVerified) return NextResponse.json({ message: "Account not verified. Please complete registration" }, { status: 403 });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return NextResponse.json({ message: "Incorrect password" }, { status: 401 });
        const token = signToken({ id: user._id.toString(), role: "user", name: user.name, phone: user.phone });
        const response = NextResponse.json({ message: "Login successful", user: { name: user.name, phone: user.phone, email: user.email } });
        response.cookies.set("auth_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 24 * 60 * 60, path: "/" });
        return response;
    } catch (error) {
        console.error("User login error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
