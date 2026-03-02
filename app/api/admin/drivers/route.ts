import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Driver from "@/models/Driver";
import { hashPassword } from "@/lib/auth";
import { getUserFromRequest } from "@/lib/getUser";

// GET /api/admin/drivers - List all drivers
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const user = getUserFromRequest(req);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const drivers = await Driver.find()
            .select("-password")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ drivers });
    } catch (error) {
        console.error("Get drivers error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// POST /api/admin/drivers - Add new driver
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const user = getUserFromRequest(req);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { name, phone, password, rickshawNumber, nitRegistrationId } =
            await req.json();

        if (!name || !phone || !password || !rickshawNumber || !nitRegistrationId) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            );
        }

        const existing = await Driver.findOne({
            $or: [{ phone }, { rickshawNumber }, { nitRegistrationId }],
        });

        if (existing) {
            return NextResponse.json(
                { message: "Driver with same phone, rickshaw number, or NIT ID already exists" },
                { status: 409 }
            );
        }

        const hashedPassword = await hashPassword(password);
        const driver = await Driver.create({
            name: name.trim(),
            phone,
            password: hashedPassword,
            rickshawNumber: rickshawNumber.trim(),
            nitRegistrationId: nitRegistrationId.trim(),
            status: "pending",
        });

        return NextResponse.json(
            {
                message: "Driver added successfully",
                driver: {
                    id: driver._id,
                    name: driver.name,
                    phone: driver.phone,
                    rickshawNumber: driver.rickshawNumber,
                    nitRegistrationId: driver.nitRegistrationId,
                    status: driver.status,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Add driver error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
