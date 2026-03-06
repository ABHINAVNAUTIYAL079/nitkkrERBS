"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Phone, Lock, User, Car, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Spinner } from "@/components/ui";

export default function DriverRegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: "", phone: "", password: "", confirmPassword: "", rickshawNumber: "" });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: name === "phone" ? value.replace(/\D/g, "") : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) { toast.error("Passwords do not match."); return; }
        if (form.password.length < 6) { toast.error("Password must be at least 6 characters."); return; }
        if (!/^\d{10}$/.test(form.phone)) { toast.error("Phone number must be exactly 10 digits."); return; }
        setLoading(true);
        try {
            const res = await fetch("/api/auth/driver/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: form.name, phone: form.phone, password: form.password, rickshawNumber: form.rickshawNumber }),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.message || "Registration failed."); return; }
            setSuccess(true);
        } catch (err) {
            toast.error(err instanceof TypeError ? "Network error. Please check your connection." : "Something went wrong. Please try again.");
        } finally { setLoading(false); }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4">
                <div className="w-full max-w-md text-center">
                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-10 shadow-2xl">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/30">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Registration Submitted!</h2>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8">
                            Your driver account has been created and is{" "}
                            <span className="text-yellow-400 font-semibold">pending admin approval</span>.
                            You will be able to login once an admin approves your account.
                        </p>
                        <Link href="/login" className="inline-block w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl text-sm">
                            Go to Driver Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/30">
                        <img src="/logo.png" alt="NIT KKR E-Rickshaw Logo" className="w-16 h-16 rounded-2xl object-cover" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Driver Registration</h1>
                    <p className="text-slate-400 text-sm mt-1">NIT KKR E-Rickshaw System</p>
                </div>
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <div className="flex items-center gap-2 mb-6">
                        <h2 className="text-lg font-semibold text-white">Create Driver Account</h2>
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">Pending Approval</span>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div><label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                            <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="text" name="name" required value={form.name} onChange={handleChange} placeholder="Enter your full name" className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm" /></div></div>
                        <div><label className="block text-xs font-medium text-slate-300 mb-1.5">Phone Number</label>
                            <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="tel" name="phone" required maxLength={10} value={form.phone} onChange={handleChange} placeholder="10-digit phone number" className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm" /></div></div>
                        <div><label className="block text-xs font-medium text-slate-300 mb-1.5">Rickshaw Number</label>
                            <div className="relative"><Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="text" name="rickshawNumber" required value={form.rickshawNumber} onChange={handleChange} placeholder="e.g. HR01AB1234" className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm uppercase" /></div></div>
                        <div><label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                            <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type={showPassword ? "text" : "password"} name="password" required value={form.password} onChange={handleChange} placeholder="Min. 6 characters" className="w-full pl-10 pr-10 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm" />
                                <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
                        <div><label className="block text-xs font-medium text-slate-300 mb-1.5">Confirm Password</label>
                            <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type={showConfirm ? "text" : "password"} name="confirmPassword" required value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter your password"
                                    className={`w-full pl-10 pr-10 py-2.5 bg-white/10 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 text-sm ${form.confirmPassword && form.password !== form.confirmPassword ? "border-red-400/50 focus:ring-red-400" : "border-white/20 focus:ring-blue-400"}`} />
                                <button type="button" onClick={() => setShowConfirm((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
                            {form.confirmPassword && form.password !== form.confirmPassword && (<p className="text-red-400 text-xs mt-1">Passwords do not match</p>)}</div>
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 text-xs text-yellow-300">
                            ⚠️ Your account will require <span className="font-semibold">admin approval</span> before you can login and accept rides.</div>
                        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-60 text-sm mt-2">
                            {loading ? <Spinner size="sm" /> : "Register as Driver"}</button>
                    </form>
                    <p className="text-center text-xs text-slate-500 mt-6">
                        Already registered?{" "}<Link href="/login" className="text-blue-400 hover:underline">Sign in here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
