export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
    const sizeClasses = {
        sm: "w-4 h-4 border-2",
        md: "w-8 h-8 border-2",
        lg: "w-12 h-12 border-4",
    };
    return (
        <div
            className={`${sizeClasses[size]} border-green-500 border-t-transparent rounded-full animate-spin`}
        />
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
