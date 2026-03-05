"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    LogOut,
    ShieldCheck,
    RefreshCw,
    MapPin,
    Users,
    BookOpen,
    TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { StatusBadge, Spinner } from "@/components/ui";

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

export default function AdminDashboard() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState("");
    const [searchPhone, setSearchPhone] = useState("");

    const fetchBookings = useCallback(async () => {
        const params = new URLSearchParams();
        if (statusFilter) params.set("status", statusFilter);
        if (searchPhone) params.set("phone", searchPhone);
        const res = await fetch(`/api/bookings?${params}`);
        if (res.status === 401) { router.push("/login"); return; }
        const data = await res.json();
        setBookings(data.bookings || []);
    }, [statusFilter, searchPhone, router]);

    useEffect(() => {
        fetchBookings().finally(() => setLoading(false));
    }, [fetchBookings]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchBookings();
        setRefreshing(false);
    };

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    };

    const stats = {
        total: bookings.length,
        pending: bookings.filter((b) => b.status === "pending").length,
        active: bookings.filter((b) => ["accepted", "on_the_way"].includes(b.status)).length,
        completed: bookings.filter((b) => b.status === "completed").length,
    };

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-[1001] shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="font-bold text-slate-800 text-lg">Admin Panel</span>
                            <span className="text-slate-400 ml-2 text-sm">NIT KKR E-Rickshaw</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/drivers"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                        >
                            <Users className="w-4 h-4" />
                            Drivers
                        </Link>
                        <button
                            onClick={handleRefresh}
                            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total Bookings", value: stats.total, icon: BookOpen, color: "bg-blue-500" },
                        { label: "Pending", value: stats.pending, icon: TrendingUp, color: "bg-yellow-500" },
                        { label: "Active", value: stats.active, icon: MapPin, color: "bg-purple-500" },
                        { label: "Completed", value: stats.completed, icon: ShieldCheck, color: "bg-green-500" },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-2xl font-bold text-slate-800">{value}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3">
                    <input
                        type="tel"
                        maxLength={10}
                        placeholder="Filter by phone..."
                        value={searchPhone}
                        onChange={(e) => setSearchPhone(e.target.value.replace(/\D/g, ""))}
                        className="flex-1 min-w-[180px] px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="on_the_way">On the Way</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                        onClick={fetchBookings}
                        className="px-4 py-2 bg-orange-500 text-white font-medium rounded-xl text-sm hover:bg-orange-600 transition-colors"
                    >
                        Apply
                    </button>
                    <button
                        onClick={() => { setStatusFilter(""); setSearchPhone(""); }}
                        className="px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-xl text-sm hover:bg-slate-50 transition-colors"
                    >
                        Clear
                    </button>
                </div>

                {/* Bookings Table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="font-semibold text-slate-800">
                            All Bookings{" "}
                            <span className="text-sm font-normal text-slate-400">
                                ({bookings.length})
                            </span>
                        </h2>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Spinner size="lg" />
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">
                            <div className="text-4xl mb-3">📭</div>
                            <p>No bookings found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 text-left">
                                        {["Booking ID", "Student", "Phone", "Route", "Driver", "Status", "Time"].map(
                                            (h) => (
                                                <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                    {h}
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {bookings.map((b) => (
                                        <tr key={b._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 font-mono text-xs text-green-600 font-semibold">
                                                {b.bookingId}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-slate-800">
                                                {b.studentName}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">{b.phone}</td>
                                            <td className="px-4 py-3 text-slate-600">
                                                <span className="text-green-600">{b.pickupLocation}</span>
                                                <span className="mx-1 text-slate-300">→</span>
                                                <span className="text-red-500">{b.dropLocation}</span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">
                                                {b.driverName || <span className="text-slate-300">—</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={b.status} />
                                            </td>
                                            <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                                                {new Date(b.createdAt).toLocaleString("en-IN", {
                                                    dateStyle: "short",
                                                    timeStyle: "short",
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
