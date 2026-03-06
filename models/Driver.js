import mongoose, { Schema } from "mongoose";

const DriverSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        phone: { type: String, required: true, unique: true, trim: true },
        password: { type: String, required: true },
        rickshawNumber: { type: String, required: true, unique: true, trim: true },
        nitRegistrationId: { type: String, unique: true, sparse: true, trim: true },
        status: {
            type: String,
            enum: ["pending", "approved", "suspended"],
            default: "pending",
        },
        isAvailable: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Driver = mongoose.models.Driver || mongoose.model("Driver", DriverSchema);

export default Driver;
