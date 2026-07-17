import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        phone: { type: String, required: true, unique: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        isVerified: { type: Boolean, default: false },
        role: { type: String, default: "user" },
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
