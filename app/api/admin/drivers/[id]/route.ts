import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Driver from "@/models/Driver";
import { hashPassword } from "@/lib/auth";
import { getUserFromRequest } from "@/lib/getUser";

export const dynamic = "force-dynamic";

// PATCH /api/admin/drivers/[id] - Approve or suspend driver
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const user = getUserFromRequest(req);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { status } = await req.json();

        if (!["approved", "suspended", "pending"].includes(status)) {
            return NextResponse.json({ message: "Invalid status" }, { status: 400 });
        }

        const driver = await Driver.findByIdAndUpdate(
            params.id,
            { status },
            { new: true }
        ).select("-password");

        if (!driver) {
            return NextResponse.json({ message: "Driver not found" }, { status: 404 });
        }

        return NextResponse.json({ message: `Driver ${status} successfully`, driver });
    } catch (error) {
        console.error("Update driver error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/admin/drivers/[id] - Remove a driver
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const user = getUserFromRequest(req);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const driver = await Driver.findByIdAndDelete(params.id);
        if (!driver) {
            return NextResponse.json({ message: "Driver not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Driver removed successfully" });
    } catch (error) {
        console.error("Delete driver error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
