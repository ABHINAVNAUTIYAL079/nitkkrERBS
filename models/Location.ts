import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILocation extends Document {
    name: string;
    description?: string;
    isActive: boolean;
}

const LocationSchema = new Schema<ILocation>(
    {
        name: { type: String, required: true, unique: true, trim: true },
        description: { type: String, default: "" },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Location: Model<ILocation> =
    mongoose.models.Location ||
    mongoose.model<ILocation>("Location", LocationSchema);

export default Location;
