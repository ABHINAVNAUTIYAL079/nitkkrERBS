"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Car, ArrowRight } from "lucide-react";

const registerOptions = [
    {
        key: "user",
        icon: "👤",
        lucide: User,
        title: "Register as User",
        description: "Create a student / staff account to book E-Rickshaw rides",
        href: "/register/user",
        gradient: "from-emerald-500 to-green-600",
        hover: "hover:border-emerald-500/60 hover:bg-emerald-500/10",
        badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        badgeText: "Student / Staff",
    },
    {
        key: "driver",
        icon: "🛺",
        lucide: Car,
        title: "Register as Rickshaw Driver",
        description: "Create a driver account to accept and manage rides (requires admin approval)",
        href: "/driver/register",
        gradient: "from-blue-500 to-blue-600",
        hover: "hover:border-blue-500/60 hover:bg-blue-500/10",
        badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        badgeText: "Driver",
    },
];

export default function RegisterSelectPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center px-4 py-12">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-20 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
            </div>
            <div className="relative w-full max-w-lg">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg shadow-emerald-500/30">
                        <img src="/logo.png" alt="NIT KKR E-Rickshaw Logo" className="w-14 h-14 rounded-2xl object-cover" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Create Account</h1>
                    <p className="text-slate-400 text-sm mt-2">Choose the type of account to register</p>
                </div>
                <div className="space-y-4">
                    {registerOptions.map((opt) => {
                        const Icon = opt.lucide;
                        return (
                            <Link key={opt.key} href={opt.href}
                                className={`group flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl transition-all duration-200 ${opt.hover} hover:scale-[1.01]`}
                            >
                                <div className={`w-12 h-12 bg-gradient-to-br ${opt.gradient} rounded-xl flex items-center justify-center text-2xl shadow-lg shrink-0`}>
                                    {opt.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                        <p className="text-white font-semibold text-base">{opt.title}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${opt.badge}`}>{opt.badgeText}</span>
                                    </div>
                                    <p className="text-slate-400 text-sm">{opt.description}</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
                            </Link>
                        );
                    })}
                </div>
                <p className="text-center text-sm text-slate-400 mt-8">
                    Already have an account?{" "}
                    <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
                        Sign In <ArrowRight className="inline w-3.5 h-3.5" />
                    </Link>
                </p>
            </div>
        </div>
    );
}
