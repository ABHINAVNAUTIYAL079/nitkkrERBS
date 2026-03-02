"use client";
import { useTheme } from "@/components/ThemeProvider";

const STARS = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    size: [2, 2, 3, 2, 2, 3, 2, 3, 2, 2, 3, 2, 2, 3, 2, 2, 3, 2, 2, 3, 2, 3][i],
    top: [5, 12, 3, 20, 8, 15, 2, 25, 10, 18, 6, 22, 1, 30, 7, 14, 4, 28, 35, 40, 45, 50][i],
    right: [5, 15, 25, 8, 35, 2, 45, 18, 55, 10, 65, 3, 75, 12, 85, 22, 40, 60, 20, 50, 70, 30][i],
    delay: [0, .8, 1.6, 2.4, .4, 1.2, 2, 2.8, .2, 1, 1.8, 2.6, .6, 1.4, 2.2, 3, .9, 1.7, 0.3, 1.5, 2.1, 0.7][i],
    duration: [4, 5, 4.5, 6, 3.5, 5.5, 4, 5, 4.5, 6, 3.5, 5.5, 4, 5, 4.5, 6, 3.5, 5.5, 4, 5, 4.5, 6][i],
    opacity: [.9, .7, 1, .8, .6, .9, .7, 1, .8, .6, .9, .7, 1, .8, .6, .9, .7, 1, .8, .6, .9, .7][i],
}));

export default function ThemeBackground() {
    const { theme } = useTheme();

    if (theme === "dark") {
        return (
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {/* Solid dark background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900" />

                {/* Falling stars: top-right → bottom-left */}
                {STARS.map((star) => (
                    <div
                        key={star.id}
                        className="absolute rounded-full bg-white falling-star"
                        style={{
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            top: `${star.top}%`,
                            right: `${star.right}%`,
                            opacity: star.opacity,
                            animationDelay: `${star.delay}s`,
                            animationDuration: `${star.duration}s`,
                        }}
                    />
                ))}

                {/* Shooting star trails */}
                {[0, 1, 2].map((i) => (
                    <div
                        key={`trail-${i}`}
                        className="absolute shooting-star"
                        style={{
                            top: `${[8, 20, 35][i]}%`,
                            right: `${[10, 30, 55][i]}%`,
                            animationDelay: `${[0, 2.5, 5][i]}s`,
                            animationDuration: "3s",
                        }}
                    />
                ))}
            </div>
        );
    }

    // Light mode: sunrise
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Solid sky gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-50 to-amber-50" />

            {/* Sun rising from bottom */}
            <div className="sunrise-sun absolute bottom-0 left-1/2 -translate-x-1/2">
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-yellow-300 via-orange-300 to-yellow-200 shadow-[0_0_100px_60px_rgba(251,191,36,0.4)] relative flex items-center justify-center">
                    {Array.from({ length: 8 }, (_, i) => (
                        <div
                            key={i}
                            className="absolute w-1.5 bg-gradient-to-t from-yellow-300/80 to-transparent rounded-full sun-ray"
                            style={{
                                height: "60px",
                                transformOrigin: "bottom center",
                                transform: `rotate(${i * 45}deg) translateY(-100px)`,
                                animationDelay: `${i * 0.15}s`,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Horizon glow */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-orange-200/60 via-yellow-100/30 to-transparent sunrise-glow" />

            {/* Soft clouds */}
            <div className="absolute top-[15%] left-[10%] w-40 h-12 bg-white/40 rounded-full blur-xl" />
            <div className="absolute top-[10%] right-[15%] w-52 h-14 bg-white/30 rounded-full blur-xl" />
            <div className="absolute top-[25%] left-[40%] w-32 h-10 bg-white/25 rounded-full blur-xl" />
        </div>
    );
}
