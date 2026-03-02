"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MapPin, Clock, Shield, Leaf, ArrowRight, LogIn, UserPlus, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Spinner } from "@/components/ui";

const KurukshetraMap = dynamic(() => import("@/components/KurukshetraMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center" style={{ height: "420px" }}>
            <div className="text-center text-slate-400"><div className="text-3xl mb-2">🗺️</div><p className="text-sm">Loading map...</p></div>
        </div>
    ),
});

export default function HomePage() {
    const [checking, setChecking] = useState(true);
    const [signInModal, setSignInModal] = useState(false);
    const [registerModal, setRegisterModal] = useState(false);

    useEffect(() => {
        // If user is already logged in as a student, redirect to dashboard
        fetch("/api/auth/me").then(async (res) => {
            if (res.ok) {
                const data = await res.json();
                if (data.user?.role === "user") {
                    window.location.href = "/dashboard";
                    return;
                }
            }
            setChecking(false);
        }).catch(() => setChecking(false));
    }, []);

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-slate-950 via-amber-950/20 to-slate-950 text-white overflow-hidden min-h-[90vh] flex flex-col">
                {/* Subtle amber glow accents */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-56 h-56 bg-yellow-400/10 rounded-full blur-2xl" />
                    <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-amber-400/8 rounded-full blur-3xl animate-pulse" />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
                    <div className="max-w-2xl mx-auto text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 rounded-full px-4 py-1.5 mb-6">
                            <img src="/logo.png" alt="Logo" className="w-4 h-4 rounded object-cover" />
                            <span className="text-amber-300 text-xs font-semibold tracking-wide uppercase">Zero Emission Transport</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
                            NIT KKR{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                                E-Rickshaw
                            </span>
                            {" "}Booking
                        </h1>
                        <p className="text-slate-300 text-lg mb-10">
                            Book quick, eco-friendly rides across campus in seconds.
                            Available 24/7 for students and staff.
                        </p>

                        {/* Features row */}
                        <div className="flex flex-wrap justify-center gap-5 mb-10">
                            {[
                                { icon: Clock, text: "Real-time tracking" },
                                { icon: Shield, text: "Safe & secure" },
                                { icon: Leaf, text: "Eco-friendly" },
                            ].map(({ icon: Icon, text }) => (
                                <div key={text} className="flex items-center gap-2 text-slate-300 text-sm">
                                    <Icon className="w-4 h-4 text-amber-400" />{text}
                                </div>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => { setSignInModal(true); setRegisterModal(false); }}
                                className="flex items-center justify-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-900 font-bold rounded-2xl shadow-xl shadow-amber-500/30 transition-all hover:scale-105 text-base"
                            >
                                <LogIn className="w-5 h-5" /> Sign In
                            </button>
                            <button
                                onClick={() => { setRegisterModal(true); setSignInModal(false); }}
                                className="flex items-center justify-center gap-2.5 px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-2xl transition-all hover:scale-105 text-base backdrop-blur-sm"
                            >
                                <UserPlus className="w-5 h-5" /> Create Account
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sign In Role Chooser Modal */}
            {signInModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                    onClick={() => setSignInModal(false)}
                >
                    <div
                        className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSignInModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold text-white mb-1">Sign In</h2>
                        <p className="text-sm text-slate-400 mb-5">Choose how you want to sign in</p>
                        <div className="space-y-3">
                            <Link
                                href="/signin"
                                onClick={() => setSignInModal(false)}
                                className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-slate-700 hover:bg-amber-900/20 hover:border-amber-700 transition-all group"
                            >
                                <span className="text-2xl">👤</span>
                                <div>
                                    <p className="font-semibold text-white text-sm group-hover:text-amber-400">Sign in as User</p>
                                    <p className="text-xs text-slate-400">Student / Staff</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 ml-auto" />
                            </Link>
                            <Link
                                href="/driver/login"
                                onClick={() => setSignInModal(false)}
                                className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-slate-700 hover:bg-blue-900/20 hover:border-blue-700 transition-all group"
                            >
                                <span className="text-2xl">🛺</span>
                                <div>
                                    <p className="font-semibold text-white text-sm group-hover:text-blue-400">Sign in as Rickshaw Driver</p>
                                    <p className="text-xs text-slate-400">Registered drivers</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 ml-auto" />
                            </Link>
                            <Link
                                href="/login"
                                onClick={() => setSignInModal(false)}
                                className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-slate-700 hover:bg-purple-900/20 hover:border-purple-700 transition-all group"
                            >
                                <span className="text-2xl">🔐</span>
                                <div>
                                    <p className="font-semibold text-white text-sm group-hover:text-purple-400">Sign in as Admin</p>
                                    <p className="text-xs text-slate-400">System administrators</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 ml-auto" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Register Role Chooser Modal */}
            {registerModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                    onClick={() => setRegisterModal(false)}
                >
                    <div
                        className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setRegisterModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold text-white mb-1">Create Account</h2>
                        <p className="text-sm text-slate-400 mb-5">Choose how you want to register</p>
                        <div className="space-y-3">
                            <Link
                                href="/register"
                                onClick={() => setRegisterModal(false)}
                                className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-slate-700 hover:bg-amber-900/20 hover:border-amber-700 transition-all group"
                            >
                                <span className="text-2xl">👤</span>
                                <div>
                                    <p className="font-semibold text-white text-sm group-hover:text-amber-400">Register as User</p>
                                    <p className="text-xs text-slate-400">Student / Staff account</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 ml-auto" />
                            </Link>
                            <Link
                                href="/driver/register"
                                onClick={() => setRegisterModal(false)}
                                className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-slate-700 hover:bg-blue-900/20 hover:border-blue-700 transition-all group"
                            >
                                <span className="text-2xl">🛺</span>
                                <div>
                                    <p className="font-semibold text-white text-sm group-hover:text-blue-400">Register as Rickshaw Driver</p>
                                    <p className="text-xs text-slate-400">Join as a driver</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 ml-auto" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Map preview */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-2xl">🗺️</span> NIT Kurukshetra Campus Map
                    </h2>
                    <span className="text-xs bg-amber-900/30 text-amber-400 border border-amber-800 px-3 py-1 rounded-full font-medium">
                        📡 Live OpenStreetMap
                    </span>
                </div>
                <KurukshetraMap height="420px" />
            </section>

            {/* Features */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className="text-2xl font-bold text-white text-center mb-10">Why E-Rickshaw?</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { icon: "⚡", title: "Electric & Green", desc: "Zero emissions. Better for campus and the environment." },
                        { icon: "🎯", title: "Easy Booking", desc: "Sign up once and book in 2 taps. No hassle." },
                        { icon: "📍", title: "Campus-Wide", desc: "Hostels, departments, mess, library, gates — all covered." },
                    ].map((f) => (
                        <div key={f.title} className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-700 hover:shadow-md hover:border-amber-700/50 transition-all">
                            <div className="w-12 h-12 bg-amber-900/30 rounded-xl flex items-center justify-center text-2xl mb-4">{f.icon}</div>
                            <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                            <p className="text-sm text-slate-400">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <div className="flex-1" />
            <Footer />
        </div>
    );
}
