export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
    // Tyre dimensions per size
    const dims = { sm: 32, md: 56, lg: 80 };
    const px = dims[size];
    const r = px / 2; // center
    const outerR = r - 2;       // outer tyre edge
    const tyreW = px * 0.12;    // tyre rubber thickness
    const rimR = outerR - tyreW; // inner rim radius
    const hubR = px * 0.09;     // center hub
    const spokeCount = 8;

    const spokes = Array.from({ length: spokeCount }, (_, i) => {
        const angle = (i * Math.PI * 2) / spokeCount;
        const x1 = r + Math.cos(angle) * hubR;
        const y1 = r + Math.sin(angle) * hubR;
        const x2 = r + Math.cos(angle) * rimR;
        const y2 = r + Math.sin(angle) * rimR;
        return { x1, y1, x2, y2 };
    });

    return (
        <svg
            width={px}
            height={px}
            viewBox={`0 0 ${px} ${px}`}
            className="animate-spin mx-auto block"
            style={{ animationDuration: "0.9s" }}
            aria-label="Loading"
        >
            {/* Outer tyre (rubber) */}
            <circle
                cx={r} cy={r} r={outerR}
                fill="none"
                stroke="#1e293b"
                strokeWidth={tyreW}
            />
            {/* Tyre highlight (gives 3D feel) */}
            <circle
                cx={r} cy={r} r={outerR}
                fill="none"
                stroke="#334155"
                strokeWidth={tyreW * 0.35}
                strokeDasharray={`${outerR * 0.4} ${outerR * 5}`}
                strokeDashoffset={`${outerR * 0.2}`}
            />
            {/* Rim ring */}
            <circle
                cx={r} cy={r} r={rimR}
                fill="none"
                stroke="#22c55e"
                strokeWidth={px * 0.045}
            />
            {/* Spokes */}
            {spokes.map((s, i) => (
                <line
                    key={i}
                    x1={s.x1} y1={s.y1}
                    x2={s.x2} y2={s.y2}
                    stroke="#4ade80"
                    strokeWidth={px * 0.03}
                    strokeLinecap="round"
                />
            ))}
            {/* Center hub */}
            <circle
                cx={r} cy={r} r={hubR}
                fill="#22c55e"
            />
            {/* Center bolt */}
            <circle
                cx={r} cy={r} r={hubR * 0.45}
                fill="#0f172a"
            />
        </svg>
    );
}

export function PageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <span className="text-2xl">⚡</span>
                </div>
                <Spinner size="md" />
                <p className="mt-4 text-sm text-slate-500">Loading...</p>
            </div>
        </div>
    );
}

export function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
        accepted: "bg-blue-100 text-blue-800 border border-blue-200",
        on_the_way: "bg-purple-100 text-purple-800 border border-purple-200",
        completed: "bg-green-100 text-green-800 border border-green-200",
        cancelled: "bg-red-100 text-red-800 border border-red-200",
        approved: "bg-green-100 text-green-800 border border-green-200",
        suspended: "bg-red-100 text-red-800 border border-red-200",
        available: "bg-green-100 text-green-800 border border-green-200",
        busy: "bg-orange-100 text-orange-800 border border-orange-200",
    };

    const labels: Record<string, string> = {
        pending: "Pending",
        accepted: "Accepted",
        on_the_way: "On the Way",
        completed: "Completed",
        cancelled: "Cancelled",
        approved: "Approved",
        suspended: "Suspended",
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || "bg-slate-100 text-slate-700"
                }`}
        >
            {labels[status] || status}
        </span>
    );
}
