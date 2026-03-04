"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Sun, Moon, ChevronDown, LogIn, UserPlus } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    return (
        <nav className="bg-slate-900/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/logo.png" alt="NIT KKR E-Rickshaw Logo" className="w-12 h-12 rounded-lg shadow-md group-hover:shadow-amber-200 transition-shadow object-cover" />
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
                            href="/login"
                            className="ml-2 flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-900 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-lg hover:shadow-md hover:shadow-amber-300/40 transition-all"
                        >
                            <LogIn className="w-4 h-4" />
                            Sign In
                        </Link>

                        <Link
                            href="/register"
                            className="ml-1 flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-amber-400 border border-amber-700 rounded-lg hover:bg-amber-900/20 transition-all font-inter"
                        >
                            <UserPlus className="w-4 h-4" />
                            Register
                        </Link>

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
                        <div className="h-px bg-slate-800 my-2 mx-4" />
                        <Link
                            href="/login"
                            className="block px-4 py-2 text-sm font-semibold text-amber-400 hover:bg-amber-900/20 rounded-lg"
                            onClick={() => setIsOpen(false)}
                        >
                            <LogIn className="w-4 h-4 inline mr-2" /> Sign In
                        </Link>
                        <Link
                            href="/register"
                            className="block px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 rounded-lg"
                            onClick={() => setIsOpen(false)}
                        >
                            <UserPlus className="w-4 h-4 inline mr-2" /> Register
                        </Link>
                    </div>
                )}
            </div>

        </nav>
    );
}
