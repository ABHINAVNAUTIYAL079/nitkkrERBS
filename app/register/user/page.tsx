"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { User, Phone, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { Spinner } from "@/components/ui";

type Step = "form" | "otp";

function generateCaptcha() {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    return { question: `${a} + ${b} = ?`, answer: String(a + b) };
}

export default function RegisterUserPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("form");
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [captcha] = useState(generateCaptcha);
    const [captchaAnswer, setCaptchaAnswer] = useState("");
    const [otp, setOtp] = useState("");
    const [devOtp, setDevOtp] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (captchaAnswer.trim() !== captcha.answer) {
            toast.error("❌ Incorrect CAPTCHA answer"); return;
        }
        if (form.password !== form.confirmPassword) {
            toast.error("Passwords do not match"); return;
        }
        if (form.password.length < 8) {
            toast.error("Password must be at least 8 characters"); return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/auth/user/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    phone: form.phone,
                    email: form.email,
                    password: form.password,
                }),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.message || "Registration failed"); return; }

            setStep("otp");
            if (data.devOtp) {
                setDevOtp(data.devOtp);
                toast.success(`📧 Dev OTP: ${data.devOtp} (shown for testing only)`, { duration: 10000 });
            } else {
                toast.success("OTP sent to your email address!");
            }
        } catch (err) {
            toast.error(err instanceof TypeError ? "Network error. Please check your connection." : "Something went wrong. Please try again.");
        } finally { setLoading(false); }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) { toast.error("Enter the 6-digit OTP"); return; }
        setLoading(true);
        try {
            const res = await fetch("/api/auth/user/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: form.email, code: otp, purpose: "register" }),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.message || "OTP verification failed"); return; }
            toast.success("🎉 Account verified! Welcome aboard!");
            window.location.href = "/dashboard";
        } catch (err) {
            toast.error(err instanceof TypeError ? "Network error. Please check your connection." : "Something went wrong. Please try again.");
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center px-4 py-12">
            {/* Background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-20 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">


                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg shadow-emerald-500/30">
                        <img src="/logo.png" alt="NIT KKR E-Rickshaw Logo" className="w-14 h-14 rounded-2xl object-cover" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">NIT KKR E-Rickshaw</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {step === "form" ? "Create your student account" : "Verify your email address"}
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-7 shadow-2xl">
                    {step === "form" ? (
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="text" required value={form.name} onChange={(e) => set("name", e.target.value)}
                                        placeholder="e.g. Rahul Sharma"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                                </div>
                            </div>

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

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type={showPass ? "text" : "password"} required value={form.password} onChange={(e) => set("password", e.target.value)}
                                        placeholder="Min. 8 characters"
                                        className="w-full pl-10 pr-10 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type={showConfirm ? "text" : "password"} required value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)}
                                        placeholder="Re-enter password"
                                        className="w-full pl-10 pr-10 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* CAPTCHA */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                                <label className="block text-xs font-medium text-slate-300 mb-2 flex items-center gap-2">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> CAPTCHA Verification
                                </label>
                                <div className="flex items-center gap-3">
                                    <span className="text-white font-bold text-lg bg-slate-700 px-3 py-1.5 rounded-lg tracking-wider select-none">
                                        {captcha.question}
                                    </span>
                                    <input type="text" required value={captchaAnswer} onChange={(e) => setCaptchaAnswer(e.target.value)}
                                        placeholder="Answer"
                                        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                                </div>
                            </div>

                            <button type="submit" disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/30 disabled:opacity-60 mt-2">
                                {loading ? <Spinner size="sm" /> : <><Mail className="w-4 h-4" /> Send OTP to Email</>}
                            </button>
                        </form>
                    ) : (
                        /* OTP Verification Step */
                        <form onSubmit={handleVerifyOtp} className="space-y-5">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-7 h-7 text-emerald-400" />
                                </div>
                                <p className="text-slate-300 text-sm">OTP sent to <span className="text-white font-semibold">{form.email}</span></p>
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
                                <p className="text-xs text-slate-500 text-center mt-1.5">OTP expires in 5 minutes</p>
                            </div>

                            <button type="submit" disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/30 disabled:opacity-60">
                                {loading ? <Spinner size="sm" /> : <><ShieldCheck className="w-4 h-4" /> Verify & Create Account</>}
                            </button>

                            <button type="button" onClick={() => setStep("form")} className="w-full text-slate-400 text-sm hover:text-white transition-colors">
                                ← Change details
                            </button>
                        </form>
                    )}

                    <p className="text-center text-sm text-slate-400 mt-5 pt-5 border-t border-slate-800">
                        Already have an account?{" "}
                        <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
                            Sign In <ArrowRight className="inline w-3.5 h-3.5" />
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
