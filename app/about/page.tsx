import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Github, Linkedin, Mail } from "lucide-react";

const teamMembers = [
    {
        name: "Ashish Kumar Pandey",
        role: "Full Stack Developer",
        rollNo: "124102006",
        branch: "Computer Science & Engineering",
        year: "2nd Year",
        email: "124102006@nitkkr.ac.in",
        github: "#",
        linkedin: "#",
        bio: "Built the core booking system and backend APIs. Passionate about clean code and scalable architecture.",
        avatar: null,
        initials: "AKP",
    },
    {
        name: "Abhinav Nautiyal",
        role: "Frontend Developer",
        rollNo: "124102002",
        branch: "Computer Science & Engineering",
        year: "2nd Year",
        email: "124102002@nitkkr.ac.in",
        github: "#",
        linkedin: "#",
        bio: "Designed the user interface and interactive components. Focused on creating smooth and accessible experiences.",
        avatar: null,
        initials: "ABHI",
    },
    {
        name: "Shalendra Sen",
        role: "Database & Backend",
        rollNo: "124102003",
        branch: "Computer Science & Engineering",
        year: "2nd Year",
        email: "124102003@nitkkr.ac.in",
        github: "#",
        linkedin: "#",
        bio: "Managed database design, authentication flows, and REST API development for the platform.",
        avatar: null,
        initials: "SHILU",
    },
    {
        name: "Mahesh",
        role: "Maps & Routing Engineer",
        rollNo: "124102005",
        branch: "Computer Science & Engineering",
        year: "2nd Year",
        email: "124102005@nitkkr.ac.in",
        github: "#",
        linkedin: "#",
        bio: "Implemented real-time campus map integration with OpenStreetMap and OSRM-based route calculation.",
        avatar: null,
        initials: "ALLKA",
    },
    {
        name: "Shivam Yadav",
        role: "UI/UX Designer",
        rollNo: "124102023",
        branch: "Computer Science & Engineering",
        year: "2nd Year",
        email: "124102023@nitkkr.ac.in",
        github: "#",
        linkedin: "#",
        bio: "Led the visual design direction, prototyping, and user research for the entire platform experience.",
        avatar: null,
        initials: "MAGGU",
    },
];

const avatarColors = [
    "from-amber-400 to-yellow-500",
    "from-orange-400 to-amber-500",
    "from-yellow-400 to-amber-400",
    "from-amber-500 to-orange-500",
    "from-yellow-500 to-amber-600",
];

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-950">
            <Navbar />

            {/* Hero */}
            <section className="relative bg-gradient-to-br from-slate-950 via-amber-950/20 to-slate-950 text-white py-20 px-4 text-center overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-yellow-400/8 rounded-full blur-3xl" />
                </div>
                <div className="relative max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 rounded-full px-4 py-1.5 mb-6">
                        <span className="text-amber-300 text-xs font-semibold tracking-wide uppercase">Our Team</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        About{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                            NIT KKR E-Rickshaw
                        </span>
                    </h1>
                    <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                        A student-built platform from NIT Kurukshetra to make campus transport
                        smarter, greener, and effortlessly accessible for everyone.
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section className="max-w-4xl mx-auto px-4 py-12 text-center">
                <div className="bg-slate-800/60 border border-amber-700/30 rounded-2xl p-8 backdrop-blur-sm">
                    <div className="text-3xl mb-3">🛺</div>
                    <h2 className="text-xl font-bold text-white mb-3">Our Mission</h2>
                    <p className="text-slate-300 text-sm leading-relaxed">
                        We built this platform as a semester project to solve a real problem on campus —
                        the lack of a simple, organized way to book e-rickshaw rides. Our goal is to reduce
                        waiting times, minimize manual coordination, and promote sustainable zero-emission
                        transport across NIT Kurukshetra.
                    </p>
                </div>
            </section>

            {/* Team Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-white mb-3">
                        Meet the{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                            Team
                        </span>
                    </h2>
                    <p className="text-slate-400 text-sm">The developers and designers behind the platform</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teamMembers.map((member, idx) => (
                        <div
                            key={member.name}
                            className="bg-slate-800/70 border border-slate-700 hover:border-amber-600/50 rounded-2xl p-6 flex flex-col items-center text-center transition-all hover:shadow-lg hover:shadow-amber-900/20 group"
                        >
                            {/* Passport-size Avatar */}
                            <div className="mb-4">
                                <div
                                    className={`w-24 h-28 rounded-xl bg-gradient-to-br ${avatarColors[idx]} flex items-center justify-center shadow-lg ring-2 ring-amber-500/30 group-hover:ring-amber-400/60 transition-all`}
                                >
                                    <span className="text-2xl font-bold text-slate-900 select-none">
                                        {member.initials}
                                    </span>
                                </div>
                            </div>

                            {/* Details */}
                            <h3 className="text-lg font-bold text-white mb-0.5">{member.name}</h3>
                            <span className="inline-block bg-amber-500/15 text-amber-300 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3">
                                {member.role}
                            </span>

                            <div className="w-full space-y-1.5 text-xs text-slate-400 mb-4">
                                <div className="flex items-center justify-between bg-slate-900/50 rounded-lg px-3 py-1.5">
                                    <span className="text-slate-500">Roll No.</span>
                                    <span className="text-slate-200 font-medium">{member.rollNo}</span>
                                </div>
                                <div className="flex items-center justify-between bg-slate-900/50 rounded-lg px-3 py-1.5">
                                    <span className="text-slate-500">Branch</span>
                                    <span className="text-slate-200 font-medium">CSE</span>
                                </div>
                                <div className="flex items-center justify-between bg-slate-900/50 rounded-lg px-3 py-1.5">
                                    <span className="text-slate-500">Year</span>
                                    <span className="text-slate-200 font-medium">{member.year}</span>
                                </div>
                            </div>

                            <p className="text-slate-400 text-xs leading-relaxed mb-5">{member.bio}</p>

                            {/* Social links */}
                            <div className="flex items-center gap-3 mt-auto">
                                <a
                                    href={`mailto:${member.email}`}
                                    className="p-2 rounded-lg bg-slate-700 hover:bg-amber-600/20 hover:text-amber-400 text-slate-400 transition-colors"
                                    title="Email"
                                >
                                    <Mail className="w-4 h-4" />
                                </a>
                                <a
                                    href={member.github}
                                    className="p-2 rounded-lg bg-slate-700 hover:bg-amber-600/20 hover:text-amber-400 text-slate-400 transition-colors"
                                    title="GitHub"
                                >
                                    <Github className="w-4 h-4" />
                                </a>
                                <a
                                    href={member.linkedin}
                                    className="p-2 rounded-lg bg-slate-700 hover:bg-amber-600/20 hover:text-amber-400 text-slate-400 transition-colors"
                                    title="LinkedIn"
                                >
                                    <Linkedin className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tech Stack */}
            <section className="max-w-4xl mx-auto px-4 py-12">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Built With</h2>
                    <p className="text-slate-400 text-sm">Technologies powering the platform</p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                    {["Next.js 14", "TypeScript", "MongoDB", "Tailwind CSS", "Leaflet Maps", "OSRM Routing", "JWT Auth", "REST APIs"].map((tech) => (
                        <span
                            key={tech}
                            className="bg-slate-800/80 border border-slate-700 hover:border-amber-600/40 text-slate-300 text-sm px-4 py-1.5 rounded-full transition-colors hover:text-amber-300"
                        >
                            {tech}
                        </span>
                    ))}
                </div>
            </section>

            <div className="flex-1" />
            <Footer />
        </div>
    );
}
