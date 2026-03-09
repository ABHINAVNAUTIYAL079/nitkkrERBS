"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Spinner } from "@/components/ui";
import { MapPin, Navigation, Clock, AlertCircle, Key } from "lucide-react";
import toast from "react-hot-toast";

const TrackingMap = dynamic(() => import("@/components/TrackingMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center" style={{ height: "400px" }}>
            <div className="text-center text-slate-400"><div className="text-3xl mb-2">🗺️</div><p className="text-sm">Loading map...</p></div>
        </div>
    ),
});

const POLL_INTERVAL = 4000; // 4 seconds

export default function TrackingPage() {
    const params = useParams();
    const bookingId = params.bookingId;
    const [tracking, setTracking] = useState(null);
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const watchIdRef = useRef(null);

    // Fetch booking details
    const fetchBooking = useCallback(async () => {
        try {
            const res = await fetch(`/api/bookings/${bookingId}`);
            if (res.ok) {
                const data = await res.json();
                setBooking(data.booking);
            }
        } catch (err) {
            console.error("Failed to fetch booking:", err);
        }
    }, [bookingId]);

    // Poll tracking data
    const fetchTracking = useCallback(async () => {
        try {
            const res = await fetch(`/api/tracking/${bookingId}`);
            if (res.ok) {
                const data = await res.json();
                setTracking(data);
            }
        } catch (err) {
            console.error("Failed to fetch tracking:", err);
        }
    }, [bookingId]);

    // Send user's GPS location
    const sendLocation = useCallback(
        async (lat, lng) => {
            try {
                await fetch(`/api/tracking/${bookingId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ lat, lng, role: "user" }),
                });
            } catch (err) {
                console.error("Failed to send location:", err);
            }
        },
        [bookingId]
    );

    // Start watching user's GPS
    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                sendLocation(position.coords.latitude, position.coords.longitude);
            },
            (err) => {
                console.error("Geolocation error:", err);
                if (err.code === 1) setError("Please allow location access to enable tracking");
            },
            { enableHighAccuracy: true, maximumAge: 3000 }
        );

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, [sendLocation]);

    // Initial fetch + polling
    useEffect(() => {
        const init = async () => {
            await Promise.all([fetchBooking(), fetchTracking()]);
            setLoading(false);
        };
        init();

        const interval = setInterval(fetchTracking, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchBooking, fetchTracking]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    const isActive = ["accepted", "on_the_way"].includes(tracking?.status || booking?.status);
    const isCompleted = (tracking?.status || booking?.status) === "completed";
    const distance = tracking?.distance;

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                        <Navigation className="w-7 h-7 text-amber-400" />
                        Live Ride Tracking
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm">
                        Booking: <span className="font-mono text-amber-400">{booking?.bookingId || bookingId}</span>
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Map — takes 2 cols on large screens */}
                    <div className="lg:col-span-2">
                        <TrackingMap
                            driverLocation={tracking?.driverLocation}
                            userLocation={tracking?.userLocation}
                            className="h-[400px] md:h-[500px]"
                        />
                    </div>

                    {/* Info panel */}
                    <div className="space-y-4">
                        {/* Ride OTP card */}
                        {booking?.rideOtp && !booking?.rideOtpVerified && isActive && (
                            <div className="bg-gradient-to-br from-amber-900/40 to-yellow-900/20 border border-amber-500/30 rounded-2xl p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Key className="w-5 h-5 text-amber-400" />
                                    <h3 className="font-bold text-amber-300">Your Ride OTP</h3>
                                </div>
                                <p className="text-xs text-slate-400 mb-3">Share this code with your driver to start the ride</p>
                                <div className="text-4xl font-mono font-bold text-center text-amber-400 tracking-[0.3em] bg-slate-900/60 rounded-xl py-4">
                                    {booking.rideOtp}
                                </div>
                            </div>
                        )}

                        {booking?.rideOtpVerified && (
                            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-center">
                                <p className="text-green-400 font-semibold text-sm">✅ Ride verified & started!</p>
                            </div>
                        )}

                        {/* Distance card */}
                        {distance && isActive && (
                            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5">
                                <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Distance to Driver</p>
                                <div className="text-3xl font-bold text-white">
                                    {distance.meters < 1000
                                        ? `${distance.meters} m`
                                        : `${distance.km} km`}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Updates every {POLL_INTERVAL / 1000}s</p>
                            </div>
                        )}

                        {/* Booking details */}
                        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-3">
                            <h3 className="font-semibold text-white text-sm">Ride Details</h3>
                            {booking?.driverName && (
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-slate-400">Driver:</span>
                                    <span className="text-white font-medium">{booking.driverName}</span>
                                </div>
                            )}
                            <div className="flex items-start gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <span className="text-green-300">{booking?.pickupLocation}</span>
                                    <span className="text-slate-500 mx-2">→</span>
                                    <span className="text-red-300">{booking?.dropLocation}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-400">
                                    Status:{" "}
                                    <span className="text-amber-400 font-medium capitalize">
                                        {(tracking?.status || booking?.status)?.replace("_", " ")}
                                    </span>
                                </span>
                            </div>
                        </div>

                        {/* Completed message */}
                        {isCompleted && (
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 text-center">
                                <div className="text-3xl mb-2">🏁</div>
                                <p className="text-emerald-400 font-semibold">Ride Completed!</p>
                                <p className="text-xs text-slate-400 mt-1">Thank you for riding with us</p>
                            </div>
                        )}

                        {/* Legend */}
                        {isActive && (
                            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3">
                                <p className="text-xs text-slate-500 font-medium mb-2">Map Legend</p>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <span className="w-3 h-3 rounded-full bg-red-500" /> Driver (🛺)
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <span className="w-3 h-3 rounded-full bg-green-500" /> You (📍)
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
