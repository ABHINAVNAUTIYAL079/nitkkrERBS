import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";
import Location from "@/models/Location";
import bcrypt from "bcryptjs";

const campusLocations = [
    { name: "Main Gate", description: "NIT KKR Main Entrance Gate", isActive: true },
    { name: "Boys Hostel Block A", description: "Block A - Ground Floor", isActive: true },
    { name: "Boys Hostel Block B", description: "Block B - Ground Floor", isActive: true },
    { name: "Boys Hostel Block C", description: "Block C - Ground Floor", isActive: true },
    { name: "Girls Hostel", description: "Girls Hostel Entrance", isActive: true },
    { name: "Academic Block 1", description: "CSE, ECE, EEE Departments", isActive: true },
    { name: "Academic Block 2", description: "Mechanical, Civil Departments", isActive: true },
    { name: "Central Library", description: "NIT KKR Central Library", isActive: true },
    { name: "SAC (Student Activity Centre)", description: "Student Activity Centre", isActive: true },
    { name: "Mess 1", description: "Main Mess Building", isActive: true },
    { name: "Mess 2", description: "North Campus Mess", isActive: true },
    { name: "Admin Block", description: "Administrative Building", isActive: true },
    { name: "Sports Complex", description: "Outdoor & Indoor Sports Facilities", isActive: true },
    { name: "Health Centre", description: "Campus Medical Centre", isActive: true },
    { name: "Workshop", description: "Engineering Workshop Area", isActive: true },
    { name: "Back Gate", description: "NIT KKR Secondary Entrance", isActive: true },
];

export async function GET() {
    try {
        await dbConnect();

        // Seed admin if not exists
        const existingAdmin = await Admin.findOne({ email: "admin@nitkkr.ac.in" });
        let adminStatus = "already exists";

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash("admin123", 12);
            await Admin.create({
                name: "NIT KKR Admin",
                email: "admin@nitkkr.ac.in",
                password: hashedPassword,
                role: "admin",
            });
            adminStatus = "created";
        }

        // Seed locations if not exists
        let locationsSeeded = 0;
        for (const loc of campusLocations) {
            const existing = await Location.findOne({ name: loc.name });
            if (!existing) {
                await Location.create(loc);
                locationsSeeded++;
            }
        }

        return NextResponse.json({
            success: true,
            message: "Setup complete!",
            admin: {
                status: adminStatus,
                email: "admin@nitkkr.ac.in",
                password: "admin123",
                note: "Change password after first login!",
            },
            locations: {
                seeded: locationsSeeded,
                total: campusLocations.length,
            },
        });
    } catch (error) {
        console.error("Setup error:", error);
        return NextResponse.json(
            { success: false, message: "Setup failed", error: String(error) },
            { status: 500 }
        );
    }
}
