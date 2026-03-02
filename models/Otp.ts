import mongoose, { Schema, Document, Model } from "mongoose";

export type OtpPurpose = "register" | "reset";

export interface IOtp extends Document {
    email: string;
    code: string;
    purpose: OtpPurpose;
    expiresAt: Date;
    // Pending registration data (only for purpose === "register")
    pendingUser?: {
        name: string;
        phone: string;
        email: string;
        password: string; // hashed
    };
}

const OtpSchema = new Schema<IOtp>({
    email: { type: String, required: true },
    code: { type: String, required: true },
    purpose: { type: String, enum: ["register", "reset"], required: true },
    expiresAt: { type: Date, required: true },
    pendingUser: {
        name: String,
        phone: String,
        email: String,
        password: String,
    },
});

// Auto-delete expired OTPs using MongoDB TTL index
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp: Model<IOtp> =
    mongoose.models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);

export default Otp;
