import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Inline models for seed script
const LocationSchema = new mongoose.Schema({ name: String, description: String, isActive: Boolean });
const AdminSchema = new mongoose.Schema({ name: String, email: String, password: String, role: String });

const Location = mongoose.models.Location || mongoose.model("Location", LocationSchema);
const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/erickshaw";

const campusLocations = [
    // Main entrance
    { name: "Main Gate", description: "NIT KKR Main Entrance Gate", isActive: true },

    // Boys Hostels
    { name: "Abhimanyu Bhawan (H1)", description: "Boys Hostel 1", isActive: true },
    { name: "Dronacharya Bhawan (H4)", description: "Boys Hostel 4", isActive: true },
    { name: "Eklavya Bhawan (H5)", description: "Boys Hostel 5", isActive: true },
    { name: "Girivar Bhawan (H7)", description: "Boys Hostel 7", isActive: true },
    { name: "Visvesvaraya Mega Boys Hostel", description: "Mega Boys Hostel (H10)", isActive: true },
    { name: "Vivekananda Bhawan", description: "Boys Hostel", isActive: true },

    // Girls Hostels
    { name: "Alaknanda Bhawan", description: "Girls Hostel", isActive: true },
    { name: "Cauvery Bhawan", description: "Girls Hostel", isActive: true },
    { name: "Kalpana Chawla Mega Girls Hostel", description: "Mega Girls Hostel", isActive: true },

    // Academic & Admin
    { name: "Central Library", description: "NIT KKR Central Library", isActive: true },
    { name: "Lecture Hall Complex (LHC)", description: "Main Lecture Halls", isActive: true },
    { name: "Main Administrative Block", description: "Administrative Building", isActive: true },
    { name: "Senate Hall", description: "Senate Meeting Hall", isActive: true },

    // Facilities
    { name: "Health Centre", description: "Campus Medical Centre", isActive: true },
    { name: "Sports Complex", description: "Outdoor & Indoor Sports Facilities", isActive: true },
    { name: "NIT Market", description: "Campus Market & Shops", isActive: true },
];

async function seed() {
    console.log("🌱 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Seed Locations
    console.log("📍 Seeding campus locations...");
    for (const loc of campusLocations) {
        await Location.findOneAndUpdate(
            { name: loc.name },
            loc,
            { upsert: true, new: true }
        );
    }
    console.log(`✅ Inserted/updated ${campusLocations.length} locations\n`);

    // Seed Admin
    console.log("👤 Seeding admin account...");
    const existingAdmin = await Admin.findOne({ email: "admin@nitkkr.ac.in" });
    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash("admin123", 12);
        await Admin.create({
            name: "NIT KKR Admin",
            email: "admin@nitkkr.ac.in",
            password: hashedPassword,
            role: "admin",
        });
        console.log("✅ Admin account created");
        console.log("   📧 Email: admin@nitkkr.ac.in");
        console.log("   🔑 Password: admin123");
        console.log("   ⚠️  CHANGE PASSWORD IN PRODUCTION!\n");
    } else {
        console.log("ℹ️  Admin account already exists, skipping.\n");
    }

    console.log("🎉 Seeding complete! You can now start the app with: npm run dev");
    await mongoose.disconnect();
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
