import Link from "next/link";
import { Mail, Phone } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <img src="/logo.png" alt="NIT KKR E-Rickshaw Logo" className="w-10 h-10 rounded-lg object-cover" />
                            <span className="font-bold text-white">NIT KKR E-Rickshaw</span>
                        </div>
                        <p className="text-sm text-slate-400">
                            Sustainable campus transport system for NIT Kurukshetra students
                            and staff.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-3">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/"
                                    className="hover:text-amber-400 transition-colors"
                                >
                                    Book a Ride
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/bookings"
                                    className="hover:text-amber-400 transition-colors"
                                >
                                    Track Booking
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/driver/login"
                                    className="hover:text-amber-400 transition-colors"
                                >
                                    Driver Portal
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/admin/login"
                                    className="hover:text-amber-400 transition-colors"
                                >
                                    Admin Panel
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-3">Contact</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-amber-400" />
                                erickshawnitkkr@gmail.com
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-amber-400" />
                                +91-9068256110,7303443491
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800 text-center text-sm text-slate-500">
                    © 2024 NIT Kurukshetra E-Rickshaw System. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
