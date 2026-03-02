import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDriver extends Document {
    name: string;
    phone: string;
    password: string;
    rickshawNumber: string;
    nitRegistrationId: string;
    status: "pending" | "approved" | "suspended";
    isAvailable: boolean;
    createdAt: Date;
}

const DriverSchema = new Schema<IDriver>(
    {
        name: { type: String, required: true, trim: true },
        phone: { type: String, required: true, unique: true, trim: true },
        password: { type: String, required: true },
        rickshawNumber: { type: String, required: true, unique: true, trim: true },
        nitRegistrationId: { type: String, required: true, unique: true, trim: true },
        status: {
            type: String,
            enum: ["pending", "approved", "suspended"],
            default: "pending",
        },
        isAvailable: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Driver: Model<IDriver> =
    mongoose.models.Driver || mongoose.model<IDriver>("Driver", DriverSchema);

export default Driver;
