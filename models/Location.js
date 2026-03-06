import mongoose, { Schema } from "mongoose";

const LocationSchema = new Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        description: { type: String, default: "" },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Location =
    mongoose.models.Location ||
    mongoose.model("Location", LocationSchema);

export default Location;
