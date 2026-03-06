import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";
import { comparePassword } from "@/lib/auth";
import { signToken } from "@/lib/jwt";

const DEFAULT_ADMIN = { name: "NIT KKR Admin", email: "admin@nitkkr.ac.in", password: "admin123", role: "admin" };

export async function POST(req) {
    try {
        await dbConnect();
        const { email, password } = await req.json();
        if (!email || !password) return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
        const adminCount = await Admin.countDocuments();
        if (adminCount === 0) {
            const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 12);
            await Admin.create({ name: DEFAULT_ADMIN.name, email: DEFAULT_ADMIN.email, password: hashedPassword, role: DEFAULT_ADMIN.role });
            console.log("✅ Default admin account auto-created");
        }
        const admin = await Admin.findOne({ email: email.toLowerCase() });
        if (!admin) return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        const isValid = await comparePassword(password, admin.password);
        if (!isValid) return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        const token = signToken({ id: admin._id.toString(), role: "admin", name: admin.name, email: admin.email });
        const response = NextResponse.json({ message: "Login successful", user: { id: admin._id, name: admin.name, email: admin.email, role: "admin" } });
        response.cookies.set("auth_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 24 * 60 * 60, path: "/" });
        return response;
    } catch (error) {
        console.error("Admin login error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
