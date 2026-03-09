"use client";
import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { MapPin, ArrowRight, LogOut, Clock, History, IndianRupee, Navigation, Users, User, Moon } from "lucide-react";
import { Spinner } from "@/components/ui";
import LocationSearch from "@/components/LocationSearch";
import { calculateFare, FARE_CONFIG, isNightTime } from "@/lib/fareUtils";

const KurukshetraMap = dynamic(() => import("@/components/KurukshetraMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center" style={{ height: "340px" }}>
            <div className="text-center text-slate-400"><div className="text-3xl mb-2">🗺️</div><p className="text-sm">Loading map…</p></div>
        </div>
    ),
});

const STATUS_STYLES = {
    pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    assigned: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    completed: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
    accepted: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    on_the_way: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [recentBookings, setRecentBookings] = useState([]);
    const [allBookings, setAllBookings] = useState([]);
    const [pickup, setPickup] = useState(null);
    const [drop, setDrop] = useState(null);
    const [distanceKm, setDistanceKm] = useState(null);
    const [durationMin, setDurationMin] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("book");
    const [rideType, setRideType] = useState("shared");
    const [isNight] = useState(() => isNightTime());

    useEffect(() => {
        async function init() {
            const meRes = await fetch("/api/auth/me");
            if (!meRes.ok) { window.location.href = "/"; return; }
            const meData = await meRes.json();
            setUser(meData.user);
            const bRes = await fetch(`/api/bookings?phone=${meData.user.phone}`);
            if (bRes.ok) {
                const bData = await bRes.json();
                const bookings = bData.bookings || [];
                setRecentBookings(bookings.slice(0, 5));
                setAllBookings(bookings);
            }
            setPageLoading(false);
        }
        init();
    }, []);

    const handleLogout = async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/"; };

    const handleRouteReady = useCallback(({ distanceKm: km, durationMin: mins }) => {
        setDistanceKm(km); setDurationMin(mins);
    }, []);

    const handlePickupChange = (result) => { setPickup(result); setDistanceKm(null); setDurationMin(null); };
    const handleDropChange = (result) => { setDrop(result); setDistanceKm(null); setDurationMin(null); };

    const fareBreakdown = distanceKm !== null ? calculateFare(distanceKm, rideType) : null;
    const fareAmount = fareBreakdown?.totalFare ?? null;

    const handleBook = async (e) => {
        e.preventDefault();
        if (!pickup || !drop) { toast.error("Please select both pickup and drop locations"); return; }
        if (pickup.label === drop.label) { toast.error("Pickup and drop cannot be the same"); return; }
        setLoading(true);
        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentName: user?.name, phone: user?.phone,
                    pickupLocation: pickup.label, dropLocation: drop.label,
                    distanceKm: distanceKm ? parseFloat(distanceKm.toFixed(2)) : null,
                    fareAmount, rideType,
                    nightSurcharge: fareBreakdown?.nightSurcharge ?? 0,
                }),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.message || "Booking failed"); return; }
            toast.success("🛺 Ride booked! Check confirmation below.");
            const confirmUrl = `/booking-confirm?bookingId=${data.booking.bookingId}&id=${data.booking.id}&name=${encodeURIComponent(user?.name || "")}&distance=${distanceKm ? distanceKm.toFixed(2) : ""}&fare=${fareAmount ?? ""}&rideType=${rideType}`;
            window.location.href = confirmUrl;
        } catch { toast.error("Network error."); }
        finally { setLoading(false); }
    };

    if (pageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center theme-text"><Spinner size="lg" /><p className="mt-4 text-sm">Loading your dashboard…</p></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <header className="sticky top-0 z-[1001] bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-4 py-3">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"><img src="/logo.png" alt="NIT KKR E-Rickshaw Logo" className="w-8 h-8 rounded-lg object-cover" /></div>
                        <div><p className="text-white font-bold text-lg leading-none">NIT KKR E-Rickshaw</p><p className="text-slate-400 text-sm">Student Dashboard</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-slate-300 text-sm hidden sm:block">👋 <span className="text-white font-medium">{user?.name}</span></span>
                        <button onClick={handleLogout} className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 text-sm transition-colors">
                            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span></button>
                    </div>
                </div>
            </header>
            <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
                <div className="bg-gradient-to-r from-emerald-600/20 to-green-600/10 border border-emerald-700/40 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-white">Welcome back, {user?.name?.split(" ")[0]}! 👋</h1>
                        <p className="text-emerald-300 text-sm mt-0.5">Where are you heading today?</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs bg-emerald-500/20 border border-emerald-500/30 rounded-full px-3 py-1.5 text-emerald-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />Service Active</div>
                </div>
                <div className="flex gap-2 bg-slate-800/50 rounded-2xl p-1.5 border border-slate-700">
                    <button onClick={() => setActiveTab("book")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "book" ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"}`}>
                        <MapPin className="w-4 h-4" /> Book a Ride</button>
                    <button onClick={() => setActiveTab("history")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "history" ? "bg-gradient-to-r from-slate-600 to-slate-500 text-white shadow-md" : "text-slate-400 hover:text-slate-200"}`}>
                        <History className="w-4 h-4" /> History
                        {allBookings.length > 0 && (<span className="bg-slate-600 text-slate-200 text-xs px-1.5 py-0.5 rounded-full">{allBookings.length}</span>)}</button>
                </div>
                {activeTab === "book" && (
                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-emerald-400" /> Book a Ride
                                {isNight && (<span className="ml-auto flex items-center gap-1 text-xs bg-indigo-900/40 border border-indigo-700/50 text-indigo-300 px-2 py-0.5 rounded-full"><Moon className="w-3 h-3" /> Night +₹5</span>)}
                            </h2>
                            <form onSubmit={handleBook} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-2">Ride Type</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {["shared", "private"].map((type) => {
                                            const cfg = FARE_CONFIG[type];
                                            const isSelected = rideType === type;
                                            return (
                                                <button key={type} type="button" onClick={() => setRideType(type)}
                                                    className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all ${isSelected ? (type === "shared" ? "bg-emerald-500/20 border-emerald-500/60 ring-1 ring-emerald-500/40" : "bg-blue-500/20 border-blue-500/60 ring-1 ring-blue-500/40") : "bg-slate-800/50 border-slate-700/50 hover:border-slate-500"}`}>
                                                    <div className="flex items-center gap-1.5">
                                                        {type === "shared" ? <Users className="w-4 h-4 text-emerald-400" /> : <User className="w-4 h-4 text-blue-400" />}
                                                        <span className={`text-sm font-semibold ${isSelected ? "text-white" : "text-slate-300"}`}>{cfg.label}</span>
                                                    </div>
                                                    <p className={`text-xs ${isSelected ? "text-slate-300" : "text-slate-500"}`}>{cfg.description}</p>
                                                    <p className={`text-xs font-medium mt-0.5 ${isSelected ? (type === "shared" ? "text-emerald-400" : "text-blue-400") : "text-slate-400"}`}>₹{cfg.base} base · ₹{cfg.perKm}/km</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div><label className="block text-xs font-medium text-slate-300 mb-1.5">Pickup Location</label>
                                    <LocationSearch placeholder="Search pickup (e.g. NIT Main Gate)" value={pickup} onChange={handlePickupChange} markerColor="green" id="pickup-search" /></div>
                                <div><label className="block text-xs font-medium text-slate-300 mb-1.5">Drop Location</label>
                                    <LocationSearch placeholder="Search drop (e.g. Railway Station)" value={drop} onChange={handleDropChange} markerColor="red" id="drop-search" /></div>
                                {pickup && drop && (
                                    <div className={`rounded-xl border p-4 transition-all ${distanceKm !== null ? "bg-emerald-900/20 border-emerald-700/40" : "bg-slate-800/60 border-slate-700/50"}`}>
                                        {distanceKm === null ? (
                                            <div className="flex items-center gap-2 text-slate-400 text-sm"><Spinner size="sm" /><span>Calculating route &amp; fare…</span></div>
                                        ) : (
                                            <div className="space-y-2.5">
                                                <div className="flex items-center gap-2 text-slate-300 text-sm">
                                                    <Navigation className="w-4 h-4 text-orange-400" />
                                                    <span className="font-medium">{distanceKm.toFixed(1)} km</span>
                                                    {durationMin !== null && (<span className="text-slate-500">· ~{durationMin} min</span>)}
                                                </div>
                                                {fareBreakdown && (
                                                    <div className="bg-slate-900/40 rounded-lg p-3 space-y-1.5 text-xs">
                                                        <div className="flex justify-between text-slate-400"><span>Base fare ({FARE_CONFIG[rideType].label})</span><span>₹{fareBreakdown.baseFare}</span></div>
                                                        {fareBreakdown.distanceFare > 0 && (<div className="flex justify-between text-slate-400"><span>Distance ({distanceKm.toFixed(1)} km − {FARE_CONFIG[rideType].freeKm} km free)</span><span>₹{fareBreakdown.distanceFare}</span></div>)}
                                                        {fareBreakdown.isNight && (<div className="flex justify-between text-indigo-400"><span className="flex items-center gap-1"><Moon className="w-3 h-3" /> Night surcharge</span><span>+₹{fareBreakdown.nightSurcharge}</span></div>)}
                                                        <div className="border-t border-slate-700 pt-1.5 flex justify-between font-semibold text-white">
                                                            <span>Total Fare</span>
                                                            <span className="flex items-center gap-1 text-emerald-400"><IndianRupee className="w-3.5 h-3.5" />{fareBreakdown.totalFare}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                <p className="text-xs text-slate-500">Final fare may vary slightly based on actual route</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <button type="submit" disabled={loading || !pickup || !drop} className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                                    {loading ? <Spinner size="sm" /> : <>Confirm Booking <ArrowRight className="w-4 h-4" /></>}</button>
                            </form>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2"><Clock className="w-5 h-5 text-slate-400" /> Recent Bookings</h2>
                            {recentBookings.length === 0 ? (
                                <div className="text-center py-8 text-slate-500"><div className="text-4xl mb-3">🛺</div><p className="text-sm">No rides yet — book your first ride!</p></div>
                            ) : (
                                <div className="space-y-3">
                                    {recentBookings.map((b) => (
                                        <div key={b.bookingId} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3.5">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white text-sm font-medium truncate">{b.pickupLocation.split(",")[0]} → {b.dropLocation.split(",")[0]}</p>
                                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                        <p className="text-slate-500 text-xs">#{b.bookingId} · {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                                                        {b.fareAmount && (<span className="text-emerald-400 text-xs font-medium">₹{b.fareAmount}</span>)}
                                                        {b.distanceKm && (<span className="text-slate-500 text-xs">{b.distanceKm.toFixed(1)} km</span>)}
                                                    </div>
                                                </div>
                                                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${STATUS_STYLES[b.status] || "bg-slate-700 text-slate-300 border-slate-600"}`}>{b.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === "history" && (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><History className="w-5 h-5 text-slate-400" /> Ride History<span className="ml-auto text-xs text-slate-400 font-normal">{allBookings.length} total rides</span></h2>
                        {allBookings.length === 0 ? (
                            <div className="text-center py-16 text-slate-500">
                                <div className="text-5xl mb-4">🛺</div>
                                <p className="text-base font-medium text-slate-400">No rides yet!</p>
                                <p className="text-sm mt-1">Book your first ride to see history here.</p>
                                <button onClick={() => setActiveTab("book")} className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl text-sm hover:opacity-90">
                                    Book a Ride <ArrowRight className="w-4 h-4" /></button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {allBookings.map((b, index) => (
                                    <div key={b.bookingId} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-colors">
                                        <div className="flex items-start justify-between gap-3 flex-wrap">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs text-slate-500 font-mono bg-slate-700/50 px-1.5 py-0.5 rounded">#{allBookings.length - index}</span>
                                                    <span className="text-xs text-slate-500 font-mono">{b.bookingId}</span>
                                                </div>
                                                <p className="text-white text-sm font-medium">
                                                    <span className="text-emerald-400">📍</span> {b.pickupLocation.split(",")[0]}
                                                    <span className="text-slate-500 mx-2">→</span>
                                                    <span className="text-red-400">🏁</span> {b.dropLocation.split(",")[0]}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                    <p className="text-slate-500 text-xs">🕐 {new Date(b.createdAt).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                                                    {b.distanceKm && (<span className="text-slate-400 text-xs">📏 {b.distanceKm.toFixed(1)} km</span>)}
                                                    {b.fareAmount && (<span className="text-emerald-400 text-xs font-semibold">₹{b.fareAmount}</span>)}
                                                </div>
                                            </div>
                                            <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${STATUS_STYLES[b.status] || "bg-slate-700 text-slate-300 border-slate-600"}`}>{b.status?.replace("_", " ")}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {activeTab === "book" && (
                    <div>
                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2"><span className="text-xl">🗺️</span> Route Map</h2>
                            <span className="text-xs bg-emerald-900/40 text-emerald-400 border border-emerald-800 rounded-full px-3 py-1">
                                {pickup && drop ? `${pickup.label.split(",")[0]} → ${drop.label.split(",")[0]}` : "Search pickup & drop to see route"}</span>
                        </div>
                        <KurukshetraMap
                            pickupCoords={pickup ? { lat: pickup.lat, lng: pickup.lng, label: pickup.label } : null}
                            dropCoords={drop ? { lat: drop.lat, lng: drop.lng, label: drop.label } : null}
                            onRouteReady={handleRouteReady}
                            height="360px"
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
