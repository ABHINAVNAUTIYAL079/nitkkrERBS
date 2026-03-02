"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Sun, Moon, ChevronDown, LogIn, UserPlus } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [signInOpen, setSignInOpen] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    return (
        <nav className="bg-slate-900/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/logo.png" alt="NIT KKR E-Rickshaw Logo" className="w-8 h-8 rounded-lg shadow-md group-hover:shadow-amber-200 transition-shadow object-cover" />
                        <div>
                            <span className="font-bold text-white text-sm leading-tight block">
                                NIT KKR
                            </span>
                            <span className="text-amber-400 font-semibold text-xs leading-tight block">
                                E-Rickshaw
                            </span>
                        </div>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-1">
                        <Link
                            href="/about"
                            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-amber-400 hover:bg-amber-900/20 rounded-lg transition-colors"
                        >
                            About Us
                        </Link>
                        <Link
                            href="/contact"
                            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-amber-400 hover:bg-amber-900/20 rounded-lg transition-colors"
                        >
                            Contact Us
                        </Link>

                        {/* Sign In Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => { setSignInOpen(!signInOpen); setRegisterOpen(false); }}
                                className="ml-2 flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-900 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-lg hover:shadow-md hover:shadow-amber-300/40 transition-all"
                            >
                                <LogIn className="w-4 h-4" />
                                Sign In
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${signInOpen ? "rotate-180" : ""}`} />
                            </button>
                            {signInOpen && (
                                <div className="absolute right-0 mt-2 w-52 bg-slate-800 rounded-xl shadow-xl border border-slate-700 py-1 z-50">
                                    <Link
                                        href="/signin"
                                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-amber-900/20 hover:text-amber-400 transition-colors"
                                        onClick={() => setSignInOpen(false)}
                                    >
                                        <span className="text-base">👤</span> Sign in as User
                                    </Link>
                                    <Link
                                        href="/driver/login"
                                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-blue-900/20 hover:text-blue-400 transition-colors"
                                        onClick={() => setSignInOpen(false)}
                                    >
                                        <span className="text-base">🛺</span> Sign in as Rickshaw Driver
                                    </Link>
                                    <Link
                                        href="/login"
                                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-purple-900/20 hover:text-purple-400 transition-colors"
                                        onClick={() => setSignInOpen(false)}
                                    >
                                        <span className="text-base">🔐</span> Sign in as Admin
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Create Account Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => { setRegisterOpen(!registerOpen); setSignInOpen(false); }}
                                className="ml-1 flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-amber-400 border border-amber-700 rounded-lg hover:bg-amber-900/20 transition-all"
                            >
                                <UserPlus className="w-4 h-4" />
                                Register
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${registerOpen ? "rotate-180" : ""}`} />
                            </button>
                            {registerOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-xl shadow-xl border border-slate-700 py-1 z-50">
                                    <Link
                                        href="/register"
                                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-amber-900/20 hover:text-amber-400 transition-colors"
                                        onClick={() => setRegisterOpen(false)}
                                    >
                                        <span className="text-base">👤</span> Register as User
                                    </Link>
                                    <Link
                                        href="/driver/register"
                                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-blue-900/20 hover:text-blue-400 transition-colors"
                                        onClick={() => setRegisterOpen(false)}
                                    >
                                        <span className="text-base">🛺</span> Register as Rickshaw Driver
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Dark/Light Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="ml-2 p-2 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
                            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {theme === "dark" ? (
                                <Sun className="w-5 h-5 text-yellow-400" />
                            ) : (
                                <Moon className="w-5 h-5 text-slate-600" />
                            )}
                        </button>
                    </div>

                    {/* Mobile: toggle + menu button */}
                    <div className="md:hidden flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
                            title="Toggle theme"
                        >
                            {theme === "dark" ? (
                                <Sun className="w-5 h-5 text-yellow-400" />
                            ) : (
                                <Moon className="w-5 h-5 text-slate-600" />
                            )}
                        </button>
                        <button
                            className="p-2 rounded-lg text-slate-300 hover:bg-slate-800"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {isOpen && (
                    <div className="md:hidden pb-4 space-y-1">
                        <Link
                            href="/about"
                            className="block px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg"
                            onClick={() => setIsOpen(false)}
                        >
                            About Us
                        </Link>
                        <Link
                            href="/contact"
                            className="block px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg"
                            onClick={() => setIsOpen(false)}
                        >
                            Contact Us
                        </Link>
                        <div className="px-4 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">Sign In As</div>
                        <Link
                            href="/signin"
                            className="block px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg"
                            onClick={() => setIsOpen(false)}
                        >
                            👤 User
                        </Link>
                        <Link
                            href="/driver/login"
                            className="block px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg"
                            onClick={() => setIsOpen(false)}
                        >
                            🛺 Rickshaw Driver
                        </Link>
                        <Link
                            href="/login"
                            className="block px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg"
                            onClick={() => setIsOpen(false)}
                        >
                            🔐 Admin
                        </Link>
                        <div className="px-4 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">Register As</div>
                        <Link
                            href="/register"
                            className="block px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg"
                            onClick={() => setIsOpen(false)}
                        >
                            👤 User
                        </Link>
                        <Link
                            href="/driver/register"
                            className="block px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg"
                            onClick={() => setIsOpen(false)}
                        >
                            🛺 Rickshaw Driver
                        </Link>
                    </div>
                )}
            </div>
            {/* Backdrop to close dropdowns */}
            {(signInOpen || registerOpen) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => { setSignInOpen(false); setRegisterOpen(false); }}
                />
            )}
        </nav>
    );
}
