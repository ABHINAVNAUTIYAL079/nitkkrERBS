"use client";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { Spinner } from "@/components/ui";

type Step = "email" | "otp" | "reset";

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<Step>("email");
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [devOtp, setDevOtp] = useState<string | null>(null);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Step 1: Request OTP
    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/auth/user/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.message || "Failed to send OTP"); return; }
            setStep("otp");
            if (data.devOtp) {
                setDevOtp(data.devOtp);
                toast.success(`📧 Dev OTP: ${data.devOtp}`, { duration: 10000 });
            } else {
                toast.success("OTP sent to your email!");
            }
        } catch { toast.error("Network error."); }
        finally { setLoading(false); }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) { toast.error("Enter the 6-digit OTP"); return; }
        setLoading(true);
        try {
            const res = await fetch("/api/auth/user/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code: otp, purpose: "reset" }),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.message || "OTP verification failed"); return; }
            setStep("reset");
            toast.success("OTP verified! Set your new password.");
        } catch { toast.error("Network error."); }
        finally { setLoading(false); }
    };

    // Step 3: Reset Password
    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
        if (newPassword.length < 8) { toast.error("Password must be at least 8 characters"); return; }
        setLoading(true);
        try {
            const res = await fetch("/api/auth/user/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.message || "Reset failed"); return; }
            toast.success("Password reset successfully! Please sign in.");
            window.location.href = "/login";
        } catch { toast.error("Network error."); }
        finally { setLoading(false); }
    };

    const stepLabels = ["Enter Email", "Verify OTP", "New Password"];
    const currentStepIdx = step === "email" ? 0 : step === "otp" ? 1 : 2;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center px-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-20 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg shadow-emerald-500/30">
                        <img src="/logo.png" alt="NIT KKR E-Rickshaw Logo" className="w-14 h-14 rounded-2xl object-cover" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
                    <p className="text-slate-400 text-sm mt-1">Reset via OTP sent to your email</p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {stepLabels.map((label, i) => (
                        <div key={label} className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${i < currentStepIdx ? "bg-emerald-500 text-white" : i === currentStepIdx ? "bg-emerald-500 text-white ring-4 ring-emerald-500/30" : "bg-slate-700 text-slate-400"}`}>
                                {i < currentStepIdx ? "✓" : i + 1}
                            </div>
                            <span className={`text-xs hidden sm:block ${i === currentStepIdx ? "text-white" : "text-slate-500"}`}>{label}</span>
                            {i < stepLabels.length - 1 && <div className={`w-8 h-0.5 ${i < currentStepIdx ? "bg-emerald-500" : "bg-slate-700"}`} />}
                        </div>
                    ))}
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-7 shadow-2xl">
                    {step === "email" && (
                        <form onSubmit={handleRequestOtp} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">Registered Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="email" required value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                                </div>
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all disabled:opacity-60">
                                {loading ? <Spinner size="sm" /> : <><Mail className="w-4 h-4" /> Send OTP</>}
                            </button>
                        </form>
                    )}

                    {step === "otp" && (
                        <form onSubmit={handleVerifyOtp} className="space-y-5">
                            <div className="text-center">
                                <p className="text-slate-300 text-sm">OTP sent to <span className="text-white font-semibold">{email}</span></p>
                                {devOtp && (
                                    <div className="mt-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300">
                                        🧪 <strong>Dev mode OTP:</strong> <span className="font-mono text-lg text-amber-200">{devOtp}</span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5 text-center">Enter 6-digit OTP</label>
                                <input type="text" required maxLength={6} value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                    placeholder="• • • • • •"
                                    className="w-full text-center text-2xl tracking-[0.5em] font-mono py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                <p className="text-xs text-slate-500 text-center mt-1.5">Expires in 5 minutes</p>
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl disabled:opacity-60">
                                {loading ? <Spinner size="sm" /> : <><ShieldCheck className="w-4 h-4" /> Verify OTP</>}
                            </button>
                            <button type="button" onClick={() => setStep("email")} className="w-full text-slate-400 text-sm hover:text-white">← Change email</button>
                        </form>
                    )}

                    {step === "reset" && (
                        <form onSubmit={handleReset} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type={showPass ? "text" : "password"} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min. 8 characters"
                                        className="w-full pl-10 pr-10 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirm New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type={showConfirm ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter new password"
                                        className="w-full pl-10 pr-10 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl disabled:opacity-60 mt-2">
                                {loading ? <Spinner size="sm" /> : <>Reset Password <ArrowRight className="w-4 h-4" /></>}
                            </button>
                        </form>
                    )}

                    <p className="text-center text-sm text-slate-400 mt-5 pt-5 border-t border-slate-800">
                        Remembered it?{" "}
                        <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
