import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Driver from "@/models/Driver";
import { hashPassword } from "@/lib/auth";
import { getUserFromRequest } from "@/lib/getUser";

export const dynamic = "force-dynamic";

// POST /api/admin/drivers/[id]/reset-password
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const user = getUserFromRequest(req);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { newPassword } = await req.json();
        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json(
                { message: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        const hashed = await hashPassword(newPassword);
        const driver = await Driver.findByIdAndUpdate(
            params.id,
            { password: hashed },
            { new: true }
        ).select("-password");

        if (!driver) {
            return NextResponse.json({ message: "Driver not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
