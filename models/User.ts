import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    name: string;
    phone: string;
    email: string;
    password: string;
    isVerified: boolean;
    role: "user";
    createdAt: Date;
}

const UserSchema = new Schema<IUser>(
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

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
