import mongoose, { Schema } from "mongoose";

const BookingSchema = new Schema(
    {
        bookingId: { type: String, required: true, unique: true },
        studentName: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        pickupLocation: { type: String, required: true },
        dropLocation: { type: String, required: true },
        status: {
            type: String,
            enum: ["pending", "accepted", "on_the_way", "completed", "cancelled"],
            default: "pending",
        },
        driverId: { type: Schema.Types.ObjectId, ref: "Driver", default: null },
        driverName: { type: String, default: null },
        notes: { type: String, default: "" },
        distanceKm: { type: Number, default: null },
        fareAmount: { type: Number, default: null },
        rideType: { type: String, enum: ["shared", "private"], default: null },
        nightSurcharge: { type: Number, default: 0 },
        rideOtp: { type: String, default: null },
        rideOtpVerified: { type: Boolean, default: false },
        driverLocation: {
            lat: { type: Number, default: null },
            lng: { type: Number, default: null },
            updatedAt: { type: Date, default: null },
        },
        userLocation: {
            lat: { type: Number, default: null },
            lng: { type: Number, default: null },
            updatedAt: { type: Date, default: null },
        },
    },
    { timestamps: true }
);

// Index for efficient queries
BookingSchema.index({ phone: 1, createdAt: -1 });
BookingSchema.index({ status: 1, createdAt: -1 });

const Booking = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);

export default Booking;
