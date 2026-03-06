"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { MapPin, LogOut, RefreshCw, CheckCircle, Navigation, History, Clock } from "lucide-react";
import { StatusBadge, Spinner } from "@/components/ui";

const STATUS_STYLES = {
    pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    assigned: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    accepted: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    on_the_way: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    completed: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
};

export default function DriverDashboard() {
    const router = useRouter();
    const [driver, setDriver] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [myRide, setMyRide] = useState(null);
    const [rideHistory, setRideHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [updating, setUpdating] = useState(null);
    const [activeTab, setActiveTab] = useState("rides");

    const fetchDriver = useCallback(async () => {
        const res = await fetch("/api/driver/availability");
        if (res.status === 401) { router.push("/login"); return; }
        const data = await res.json();
        setDriver(data.driver);
    }, [router]);

    const fetchPending = useCallback(async () => {
        const res = await fetch("/api/bookings/pending");
        if (res.ok) { const data = await res.json(); setBookings(data.bookings || []); }
    }, []);

    const fetchHistory = useCallback(async () => {
        const res = await fetch("/api/driver/history");
        if (res.ok) { const data = await res.json(); setRideHistory(data.bookings || []); }
    }, []);

    const fetchAll = useCallback(async () => {
        await Promise.all([fetchDriver(), fetchPending(), fetchHistory()]);
        setLoading(false);
    }, [fetchDriver, fetchPending, fetchHistory]);

    useEffect(() => {
        fetchAll();
        const interval = setInterval(fetchPending, 30000);
        return () => clearInterval(interval);
    }, [fetchAll, fetchPending]);

    const handleRefresh = async () => { setRefreshing(true); await fetchAll(); setRefreshing(false); toast.success("Refreshed"); };

    const handleAvailabilityToggle = async () => {
        if (!driver) return;
        try {
            const res = await fetch("/api/driver/availability", { method: "PATCH" });
            const data = await res.json();
            if (!res.ok) { toast.error(data.message); return; }
            setDriver((prev) => prev ? { ...prev, isAvailable: data.isAvailable } : prev);
            toast.success(data.message);
        } catch { toast.error("Failed to update availability"); }
    };

    const handleAccept = async (booking) => {
        setUpdating(booking._id);
        try {
            const res = await fetch(`/api/bookings/${booking._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "accepted" }) });
            const data = await res.json();
            if (!res.ok) { toast.error(data.message); return; }
            setMyRide({ ...booking, status: "accepted" });
            setBookings((prev) => prev.filter((b) => b._id !== booking._id));
            setDriver((prev) => prev ? { ...prev, isAvailable: false } : prev);
            toast.success("Ride accepted!");
        } catch { toast.error("Failed to accept ride"); }
        finally { setUpdating(null); }
    };

    const handleStatusUpdate = async (status) => {
        if (!myRide) return;
        setUpdating(myRide._id);
        try {
            const res = await fetch(`/api/bookings/${myRide._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
            const data = await res.json();
            if (!res.ok) { toast.error(data.message); return; }
            if (status === "completed") {
                const completedRide = { ...myRide, status: "completed" };
                setRideHistory((prev) => [completedRide, ...prev]);
                setMyRide(null);
                setDriver((prev) => prev ? { ...prev, isAvailable: true } : prev);
                toast.success("Ride completed! You are now available."); fetchPending();
            } else {
                setMyRide((prev) => prev ? { ...prev, status } : null);
                toast.success(`Status updated to: ${status.replace("_", " ")}`);
            }
        } catch { toast.error("Failed to update status"); }
        finally { setUpdating(null); }
    };

    const handleLogout = async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); };

    if (loading) return (<div className="min-h-screen bg-slate-900 flex items-center justify-center"><Spinner size="lg" /></div>);

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <header className="bg-slate-800 border-b border-slate-700 px-4 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"><img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-xl object-cover" /></div>
                        <div><p className="font-bold text-white">{driver?.name}</p><p className="text-xs text-slate-400">🚗 {driver?.rickshawNumber}</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={handleRefresh} className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600"><RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /></button>
                        <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-400 hover:text-red-400"><LogOut className="w-4 h-4" />Logout</button>
                    </div>
                </div>
            </header>
            <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <p className="text-sm text-slate-400 mb-1">Availability Status</p>
                            <div className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${driver?.isAvailable ? "bg-green-400 animate-pulse" : "bg-slate-500"}`} />
                                <span className="text-lg font-semibold">{driver?.isAvailable ? "Available for Rides" : "Currently Busy"}</span>
                            </div>
                        </div>
                        <button onClick={handleAvailabilityToggle} className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${driver?.isAvailable ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30" : "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"}`}>
                            {driver?.isAvailable ? "Go Offline" : "Go Online"}</button>
                    </div>
                </div>
                {myRide && (
                    <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-blue-700/50 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-4"><Navigation className="w-5 h-5 text-blue-400" /><h2 className="text-lg font-bold text-white">Active Ride</h2><StatusBadge status={myRide.status} /></div>
                        <div className="space-y-2 mb-4">
                            <p className="text-white font-medium">{myRide.studentName}</p>
                            <p className="text-slate-300 text-sm">📞 {myRide.phone}</p>
                            <div className="flex items-center gap-2 text-sm mt-2">
                                <MapPin className="w-4 h-4 text-green-400" /><span className="text-green-300">{myRide.pickupLocation}</span>
                                <span className="text-slate-500">→</span>
                                <MapPin className="w-4 h-4 text-red-400" /><span className="text-red-300">{myRide.dropLocation}</span>
                            </div>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            {myRide.status === "accepted" && (
                                <button onClick={() => handleStatusUpdate("on_the_way")} disabled={!!updating} className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl text-sm disabled:opacity-60">
                                    {updating ? <Spinner size="sm" /> : <Navigation className="w-4 h-4" />}On the Way</button>
                            )}
                            {myRide.status === "on_the_way" && (
                                <button onClick={() => handleStatusUpdate("completed")} disabled={!!updating} className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl text-sm disabled:opacity-60">
                                    {updating ? <Spinner size="sm" /> : <CheckCircle className="w-4 h-4" />}Mark Completed</button>
                            )}
                        </div>
                    </div>
                )}
                <div className="flex gap-2 bg-slate-800/80 rounded-2xl p-1.5 border border-slate-700">
                    <button onClick={() => setActiveTab("rides")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "rides" ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md" : "text-slate-400 hover:text-slate-200"}`}>
                        <MapPin className="w-4 h-4" />Pending Bookings
                        {bookings.length > 0 && (<span className="bg-yellow-500 text-yellow-950 text-xs px-1.5 py-0.5 rounded-full font-bold">{bookings.length}</span>)}</button>
                    <button onClick={() => setActiveTab("history")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "history" ? "bg-gradient-to-r from-slate-600 to-slate-500 text-white shadow-md" : "text-slate-400 hover:text-slate-200"}`}>
                        <History className="w-4 h-4" />History
                        {rideHistory.length > 0 && (<span className="bg-slate-600 text-slate-200 text-xs px-1.5 py-0.5 rounded-full">{rideHistory.length}</span>)}</button>
                </div>
                {activeTab === "rides" && (
                    <div>
                        {bookings.length === 0 ? (
                            <div className="bg-slate-800 rounded-2xl p-10 text-center border border-slate-700">
                                <div className="text-4xl mb-3">🎉</div>
                                <p className="text-slate-400">{myRide ? "You have an active ride." : "No pending bookings right now."}</p>
                                <p className="text-xs text-slate-500 mt-1">Auto-refreshes every 30 seconds</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {bookings.map((booking) => (
                                    <div key={booking._id} className="bg-slate-800 rounded-2xl p-5 border border-slate-700 hover:border-slate-600">
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2"><span className="font-mono text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">{booking.bookingId}</span></div>
                                                <p className="font-semibold text-white">{booking.studentName}</p>
                                                <p className="text-slate-400 text-sm">📞 {booking.phone}</p>
                                                <div className="flex items-center gap-2 text-sm mt-1">
                                                    <MapPin className="w-3.5 h-3.5 text-green-400" /><span className="text-green-300">{booking.pickupLocation}</span>
                                                    <span className="text-slate-500">→</span>
                                                    <MapPin className="w-3.5 h-3.5 text-red-400" /><span className="text-red-300">{booking.dropLocation}</span>
                                                </div>
                                            </div>
                                            <button onClick={() => handleAccept(booking)} disabled={!!updating || !!myRide || !driver?.isAvailable} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                                                {updating === booking._id ? <Spinner size="sm" /> : <CheckCircle className="w-4 h-4" />}Accept Ride</button>
                                        </div>
                                        {!driver?.isAvailable && !myRide && (<p className="text-xs text-yellow-400 mt-2">⚠️ Go online to accept rides</p>)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {activeTab === "history" && (
                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <History className="w-5 h-5 text-slate-400" />Ride History
                            <span className="ml-auto text-sm font-normal text-slate-400">{rideHistory.length} rides completed</span>
                        </h2>
                        {rideHistory.length === 0 ? (
                            <div className="text-center py-16 text-slate-500">
                                <div className="text-5xl mb-4">📋</div>
                                <p className="text-base font-medium text-slate-400">No ride history yet</p>
                                <p className="text-sm mt-1">Completed rides will appear here.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {rideHistory.map((ride, index) => (
                                    <div key={ride._id || ride.bookingId} className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-4 hover:border-slate-500">
                                        <div className="flex items-start justify-between gap-3 flex-wrap">
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-500 font-mono bg-slate-600/50 px-1.5 py-0.5 rounded">#{rideHistory.length - index}</span>
                                                    <span className="font-mono text-xs text-yellow-400/70">{ride.bookingId}</span>
                                                </div>
                                                <p className="font-semibold text-white text-sm">{ride.studentName}</p>
                                                <p className="text-slate-400 text-xs">📞 {ride.phone}</p>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <MapPin className="w-3.5 h-3.5 text-green-400" /><span className="text-green-300 text-sm">{ride.pickupLocation}</span>
                                                    <span className="text-slate-500">→</span>
                                                    <MapPin className="w-3.5 h-3.5 text-red-400" /><span className="text-red-300 text-sm">{ride.dropLocation}</span>
                                                </div>
                                                <p className="text-slate-500 text-xs flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(ride.createdAt).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                                            </div>
                                            <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${STATUS_STYLES[ride.status] || "bg-slate-600 text-slate-300 border-slate-500"}`}>
                                                {ride.status?.replace("_", " ")}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
