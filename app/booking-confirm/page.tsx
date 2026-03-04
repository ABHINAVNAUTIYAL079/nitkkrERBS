"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle, MapPin, ArrowLeft, Clock, IndianRupee, Users, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function ConfirmContent() {
    const params = useSearchParams();
    const bookingId = params.get("bookingId") || "—";
    const name = params.get("name") || "Student";
    const fare = params.get("fare");
    const distance = params.get("distance");
    const rideType = params.get("rideType") || "shared";

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 max-w-lg w-full p-8 text-center">
                {/* Success icon */}
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                </div>

                <h1 className="text-2xl font-bold text-slate-800 mb-2">
                    Booking Confirmed! 🎉
                </h1>
                <p className="text-slate-500 mb-6">
                    Hi <span className="font-semibold text-slate-700">{name}</span>, your
                    ride has been booked. A driver will accept your request shortly.
                </p>

                {/* Booking ID */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                        Booking ID
                    </p>
                    <p className="text-2xl font-mono font-bold text-green-600">
                        {bookingId}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                        Save this ID to track your booking
                    </p>
                </div>

                {/* Fare Summary */}
                {(fare || distance) && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 text-left">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Fare Summary</p>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-1.5 text-slate-600">
                                    {rideType === "shared"
                                        ? <><Users className="w-4 h-4 text-emerald-500" /> Shared Ride</>
                                        : <><User className="w-4 h-4 text-blue-500" /> Private Ride</>
                                    }
                                </span>
                                <span className="text-slate-500 text-xs">{distance ? `${parseFloat(distance).toFixed(1)} km` : ""}</span>
                            </div>
                            {fare && (
                                <div className="flex justify-between items-center text-sm border-t border-emerald-200 pt-2">
                                    <span className="font-semibold text-slate-700">Estimated Fare</span>
                                    <span className="flex items-center gap-1 font-bold text-emerald-600 text-lg">
                                        <IndianRupee className="w-4 h-4" />{fare}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Status timeline */}
                <div className="text-left mb-8">
                    <p className="text-sm font-semibold text-slate-700 mb-3">
                        Booking Journey
                    </p>
                    <div className="space-y-3">
                        {[
                            { label: "Booking Placed", done: true, icon: "✅" },
                            { label: "Driver Accepts", done: false, icon: "🚗" },
                            { label: "Driver On the Way", done: false, icon: "📍" },
                            { label: "Ride Completed", done: false, icon: "🏁" },
                        ].map((step) => (
                            <div key={step.label} className="flex items-center gap-3">
                                <span className="text-base">{step.icon}</span>
                                <span
                                    className={`text-sm ${step.done
                                            ? "text-green-600 font-medium"
                                            : "text-slate-400"
                                        }`}
                                >
                                    {step.label}
                                </span>
                                {step.done && (
                                    <span className="ml-auto">
                                        <Clock className="w-3.5 h-3.5 text-green-400" />
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3">
                    <Link
                        href="/dashboard"
                        className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Book Another
                    </Link>
                    <Link
                        href="/bookings"
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-md transition-all text-sm"
                    >
                        <MapPin className="w-4 h-4" />
                        Track Booking
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function BookingConfirmPage() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <Navbar />
            <Suspense fallback={<div className="min-h-screen" />}>
                <ConfirmContent />
            </Suspense>
            <Footer />
        </div>
    );
}

