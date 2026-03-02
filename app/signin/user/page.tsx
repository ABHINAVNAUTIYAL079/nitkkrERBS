"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Phone, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import { Spinner } from "@/components/ui";

export default function UserSignInPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [form, setForm] = useState({ phone: "", password: "" });
    const set = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/auth/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.message || "Login failed"); return; }
            toast.success(`Welcome back, ${data.user.name}! 👋`);
            window.location.href = "/dashboard";
        } catch { toast.error("Network error. Please try again."); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center px-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-20 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Back link */}
                <Link
                    href="/signin"
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Sign In options
                </Link>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg shadow-emerald-500/30">
                        <img src="/logo.png" alt="NIT KKR E-Rickshaw Logo" className="w-14 h-14 rounded-2xl object-cover" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">User Sign In</h1>
                    <p className="text-slate-400 text-sm mt-1">Sign in to your NIT KKR account</p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-7 shadow-2xl">
                    <form onSubmit={handleSignIn} className="space-y-4">
                        {/* Phone */}
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1.5">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="tel" required maxLength={10} value={form.phone}
                                    onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
                                    placeholder="10-digit mobile number"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-medium text-slate-300">Password</label>
                                <Link href="/forgot-password" className="text-xs text-emerald-400 hover:text-emerald-300">
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type={showPass ? "text" : "password"} required value={form.password}
                                    onChange={(e) => set("password", e.target.value)}
                                    placeholder="Your password"
                                    className="w-full pl-10 pr-10 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/30 disabled:opacity-60 mt-2">
                            {loading ? <Spinner size="sm" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-400 mt-5 pt-5 border-t border-slate-800">
                        New here?{" "}
                        <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
                            Create Account <ArrowRight className="inline w-3.5 h-3.5" />
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
