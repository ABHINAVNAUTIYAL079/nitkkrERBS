"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { StatusBadge, Spinner } from "@/components/ui";
import { Search, MapPin, Clock } from "lucide-react";
import toast from "react-hot-toast";

interface Booking {
    _id: string;
    bookingId: string;
    studentName: string;
    phone: string;
    pickupLocation: string;
    dropLocation: string;
    status: string;
    driverName?: string;
    createdAt: string;
}

export default function BookingsPage() {
    const [phone, setPhone] = useState("");
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!/^\d{10}$/.test(phone)) {
            toast.error("Please enter a valid 10-digit phone number");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`/api/bookings?phone=${phone}`);
            const data = await res.json();
            setBookings(data.bookings || []);
            setSearched(true);
            if ((data.bookings || []).length === 0) {
                toast("No bookings found for this number", { icon: "📭" });
            }
        } catch {
            toast.error("Failed to fetch bookings");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id: string) => {
        const confirmed = window.confirm("Cancel this booking?");
        if (!confirmed) return;
        try {
            const res = await fetch(`/api/bookings/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "cancelled" }),
            });
            if (!res.ok) {
                const d = await res.json();
                toast.error(d.message || "Cannot cancel this booking");
                return;
            }
            toast.success("Booking cancelled");
            setBookings((prev) =>
                prev.map((b) => (b._id === id ? { ...b, status: "cancelled" } : b))
            );
        } catch {
            toast.error("Network error");
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">My Bookings</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Enter your mobile number to see your ride history
                    </p>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-3 mb-10">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="tel"
                            maxLength={10}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                            placeholder="Enter 10-digit phone number"
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-sm shadow-sm placeholder-slate-400"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-md transition-all disabled:opacity-60 flex items-center gap-2"
                    >
                        {loading ? <Spinner size="sm" /> : "Search"}
                    </button>
                </form>

                {/* Results */}
                {searched && bookings.length === 0 && (
                    <div className="text-center py-16 text-slate-400">
                        <div className="text-5xl mb-4">📭</div>
                        <p className="font-medium">No bookings found for this number.</p>
                        <p className="text-sm mt-1">Try a different number or book a new ride.</p>
                    </div>
                )}

                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div
                            key={booking._id}
                            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-mono text-sm font-bold text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded">
                                            {booking.bookingId}
                                        </span>
                                        <StatusBadge status={booking.status} />
                                    </div>
                                    <div className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200 mb-1">
                                        <MapPin className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>
                                            <span className="font-medium">{booking.pickupLocation}</span>
                                            <span className="text-slate-400 mx-2">→</span>
                                            <span className="font-medium">{booking.dropLocation}</span>
                                        </span>
                                    </div>
                                    {booking.driverName && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            Driver: <span className="font-medium">{booking.driverName}</span>
                                        </p>
                                    )}
                                </div>
                                <div className="text-right space-y-2">
                                    <div className="flex items-center gap-1 text-xs text-slate-400">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(booking.createdAt).toLocaleString("en-IN", {
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                        })}
                                    </div>
                                    {booking.status === "pending" && (
                                        <button
                                            onClick={() => handleCancel(booking._id)}
                                            className="px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}
