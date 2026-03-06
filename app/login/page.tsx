"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import {
    Mail, Lock, Phone, User, Eye, EyeOff,
    ShieldCheck, Truck, UserCircle, ArrowRight
} from "lucide-react";
import { Spinner } from "@/components/ui";
import { useEffect } from "react";

type Role = "user" | "driver" | "admin";

const ROLES = [
    { id: "user" as Role, label: "User", icon: UserCircle, color: "from-green-500 to-emerald-600", accent: "green" },
    { id: "driver" as Role, label: "Driver", icon: Truck, color: "from-blue-500 to-indigo-600", accent: "blue" },
    { id: "admin" as Role, label: "Admin", icon: ShieldCheck, color: "from-orange-500 to-red-600", accent: "orange" },
];

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [role, setRole] = useState<Role>("user");

    useEffect(() => {
        const queryRole = searchParams.get("role") as Role;
        if (queryRole && ROLES.some(r => r.id === queryRole)) {
            setRole(queryRole);
        }
    }, [searchParams]);

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // ── User login ──
    const [userForm, setUserForm] = useState({ phone: "", password: "" });

    // Driver form
    const [driverForm, setDriverForm] = useState({ phone: "", password: "" });

    // Admin form
    const [adminForm, setAdminForm] = useState({ email: "", password: "" });

    const activeRole = ROLES.find((r) => r.id === role)!;

    // ── User login ──
    const handleUserLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!/^\d{10}$/.test(userForm.phone)) {
            toast.error("Enter a valid 10-digit phone number");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/auth/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userForm),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.message || "Login failed"); return; }
            toast.success(`Welcome back, ${data.user.name}!`);
            window.location.href = "/dashboard";
        } catch (err) { toast.error(err instanceof TypeError ? "Network error. Please check your connection." : "Something went wrong. Please try again."); }
        finally { setLoading(false); }
    };

    // ── Driver login ──
    const handleDriverLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/auth/driver/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(driverForm),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.message || "Login failed"); return; }
            toast.success(`Welcome, ${data.user.name}!`);
            // Use hard navigation so the auth cookie is sent with the middleware request
            window.location.href = "/driver/dashboard";
        } catch (err) { toast.error(err instanceof TypeError ? "Network error. Please check your connection." : "Something went wrong. Please try again."); }
        finally { setLoading(false); }
    };

    // ── Admin login ──
    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/auth/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(adminForm),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.message || "Login failed"); return; }
            toast.success(`Welcome, ${data.user.name}!`);
            // Use hard navigation so the auth cookie is sent with the middleware request
            window.location.href = "/admin/drivers";
        } catch (err) { toast.error(err instanceof TypeError ? "Network error. Please check your connection." : "Something went wrong. Please try again."); }
        finally { setLoading(false); }
    };

    const accentRing: Record<string, string> = {
        green: "focus:ring-green-400",
        blue: "focus:ring-blue-400",
        orange: "focus:ring-orange-400",
    };
    const ring = accentRing[activeRole.accent];

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 justify-center mb-4">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
                            <img src="/logo.png" alt="NIT KKR E-Rickshaw Logo" className="w-16 h-16 rounded-2xl object-cover" />
                        </div>
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">NIT KKR E-Rickshaw</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Sign in to continue</p>
                </div>

                {/* Role Selector */}
                <div className="flex gap-2 p-1 bg-white/30 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700 mb-6">
                    {ROLES.map(({ id, label, icon: Icon, color }) => (
                        <button
                            key={id}
                            onClick={() => { setRole(id); setShowPassword(false); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${role === id
                                ? `bg-gradient-to-r ${color} text-white shadow-md`
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Card */}
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 rounded-3xl p-8 shadow-2xl">

                    {/* ── USER TAB ── */}
                    {role === "user" && (
                        <>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                    <UserCircle className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-800 dark:text-white">User Login</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Sign in to book rides</p>
                                </div>
                            </div>

                            <form onSubmit={handleUserLogin} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="tel"
                                            maxLength={10}
                                            required
                                            value={userForm.phone}
                                            onChange={(e) => setUserForm({ ...userForm, phone: e.target.value.replace(/\D/g, "") })}
                                            placeholder="10-digit mobile number"
                                            className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${ring} text-sm`}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Password</label>
                                        <Link href="/forgot-password" className="text-xs text-green-500 hover:text-green-400">
                                            Forgot Password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={userForm.password}
                                            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                            placeholder="Enter your password"
                                            className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${ring} text-sm`}
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-green-500/30 disabled:opacity-60"
                                >
                                    {loading ? <Spinner size="sm" /> : <><UserCircle className="w-4 h-4" /> Sign In as User</>}
                                </button>
                                <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                                    New student?{" "}
                                    <Link href="/register" className="text-green-500 hover:underline font-medium">
                                        Create Account
                                    </Link>
                                </p>
                            </form>
                        </>
                    )}

                    {/* ── DRIVER TAB ── */}
                    {role === "driver" && (
                        <>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <Truck className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-800 dark:text-white">Driver Login</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Access your driver dashboard</p>
                                </div>
                            </div>

                            <form onSubmit={handleDriverLogin} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="tel"
                                            maxLength={10}
                                            required
                                            value={driverForm.phone}
                                            onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value.replace(/\D/g, "") })}
                                            placeholder="Registered phone number"
                                            className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${ring} text-sm`}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={driverForm.password}
                                            onChange={(e) => setDriverForm({ ...driverForm, password: e.target.value })}
                                            placeholder="Enter your password"
                                            className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${ring} text-sm`}
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 disabled:opacity-60"
                                >
                                    {loading ? <Spinner size="sm" /> : <><Truck className="w-4 h-4" /> Sign In as Driver</>}
                                </button>
                                <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                                    New driver?{" "}
                                    <Link href="/driver/register" className="text-blue-500 hover:underline font-medium">
                                        Register here
                                    </Link>
                                </p>
                            </form>
                        </>
                    )}

                    {/* ── ADMIN TAB ── */}
                    {role === "admin" && (
                        <>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-800 dark:text-white">Admin Login</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Manage drivers & bookings</p>
                                </div>
                            </div>

                            <form onSubmit={handleAdminLogin} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="email"
                                            required
                                            value={adminForm.email}
                                            onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                                            placeholder="admin@nitkkr.ac.in"
                                            className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${ring} text-sm`}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={adminForm.password}
                                            onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                                            placeholder="Enter admin password"
                                            className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${ring} text-sm`}
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-orange-500/30 disabled:opacity-60"
                                >
                                    {loading ? <Spinner size="sm" /> : <><ShieldCheck className="w-4 h-4" /> Sign In as Admin</>}
                                </button>
                                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
                                    <p className="text-xs text-orange-700 dark:text-orange-300 font-semibold mb-0.5">🔑 Default Credentials</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">Email: <span className="font-mono font-bold">admin@nitkkr.ac.in</span></p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">Password: <span className="font-mono font-bold">admin123</span></p>
                                </div>
                            </form>
                        </>
                    )}
                </div>

                <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
                    <Link href="/" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">← Back to Home</Link>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen" />}>
            <LoginContent />
        </Suspense>
    );
}
