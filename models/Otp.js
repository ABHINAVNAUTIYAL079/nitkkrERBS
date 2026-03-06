import mongoose, { Schema } from "mongoose";

const OtpSchema = new Schema({
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

const Otp = mongoose.models.Otp || mongoose.model("Otp", OtpSchema);

export default Otp;
