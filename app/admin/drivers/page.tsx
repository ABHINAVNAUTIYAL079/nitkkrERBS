"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    LogOut,
    ShieldCheck,
    PlusCircle,
    X,
    KeyRound,
    Users,
    LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { StatusBadge, Spinner } from "@/components/ui";

interface Driver {
    _id: string;
    name: string;
    phone: string;
    rickshawNumber: string;
    nitRegistrationId: string;
    status: "pending" | "approved" | "suspended";
    isAvailable: boolean;
    createdAt: string;
}

const emptyForm = {
    name: "",
    phone: "",
    password: "",
    rickshawNumber: "",
    nitRegistrationId: "",
};

export default function AdminDriversPage() {
    const router = useRouter();
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [addForm, setAddForm] = useState(emptyForm);
    const [addLoading, setAddLoading] = useState(false);
    const [resetModal, setResetModal] = useState<{ id: string; name: string } | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchDrivers = useCallback(async () => {
        const res = await fetch("/api/admin/drivers");
        if (res.status === 401) { router.push("/login"); return; }
        const data = await res.json();
        setDrivers(data.drivers || []);
    }, [router]);

    useEffect(() => {
        fetchDrivers().finally(() => setLoading(false));
    }, [fetchDrivers]);

    const handleAddDriver = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddLoading(true);
        try {
            const res = await fetch("/api/admin/drivers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(addForm),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.message); return; }
            toast.success("Driver added successfully!");
            setShowAddForm(false);
            setAddForm(emptyForm);
            fetchDrivers();
        } catch {
            toast.error("Failed to add driver");
        } finally {
            setAddLoading(false);
        }
    };

    const handleStatusChange = async (id: string, status: string) => {
        setActionLoading(id + status);
        try {
            const res = await fetch(`/api/admin/drivers/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.message); return; }
            toast.success(data.message);
            setDrivers((prev) =>
                prev.map((d) =>
                    d._id === id ? { ...d, status: status as Driver["status"] } : d
                )
            );
        } catch {
            toast.error("Failed to update driver");
        } finally {
            setActionLoading(null);
        }
    };

    const handleResetPassword = async () => {
        if (!resetModal || newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        setActionLoading(resetModal.id + "reset");
        try {
            const res = await fetch(
                `/api/admin/drivers/${resetModal.id}/reset-password`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ newPassword }),
                }
            );
            const data = await res.json();
            if (!res.ok) { toast.error(data.message); return; }
            toast.success("Password reset successfully");
            setResetModal(null);
            setNewPassword("");
        } catch {
            toast.error("Failed to reset password");
        } finally {
            setActionLoading(null);
        }
    };

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="font-bold text-slate-800">Driver Management</span>
                            <span className="text-slate-400 ml-2 text-xs">Admin Panel</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/dashboard"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </Link>
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-xl transition-colors"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Add Driver
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Add Driver Form */}
                {showAddForm && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-slate-800">Add New Driver</h2>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleAddDriver} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { key: "name", label: "Full Name", placeholder: "Driver full name", type: "text" },
                                { key: "phone", label: "Phone Number", placeholder: "10-digit number", type: "tel" },
                                { key: "password", label: "Initial Password", placeholder: "Min 6 characters", type: "password" },
                                { key: "rickshawNumber", label: "Rickshaw Number", placeholder: "e.g. ER-001", type: "text" },
                                { key: "nitRegistrationId", label: "NIT Registration ID", placeholder: "e.g. NIT-2024-001", type: "text" },
                            ].map(({ key, label, placeholder, type }) => (
                                <div key={key}>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                        {label}
                                    </label>
                                    <input
                                        type={type}
                                        required
                                        value={addForm[key as keyof typeof addForm]}
                                        onChange={(e) => setAddForm({ ...addForm, [key]: e.target.value })}
                                        placeholder={placeholder}
                                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                                    />
                                </div>
                            ))}
                            <div className="md:col-span-2 flex gap-3">
                                <button
                                    type="submit"
                                    disabled={addLoading}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-60"
                                >
                                    {addLoading ? <Spinner size="sm" /> : <PlusCircle className="w-4 h-4" />}
                                    Add Driver
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowAddForm(false); setAddForm(emptyForm); }}
                                    className="px-6 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl text-sm hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Drivers List */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                        <Users className="w-5 h-5 text-slate-500" />
                        <h2 className="font-semibold text-slate-800">
                            All Drivers{" "}
                            <span className="text-sm font-normal text-slate-400">
                                ({drivers.length})
                            </span>
                        </h2>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Spinner size="lg" />
                        </div>
                    ) : drivers.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">
                            <div className="text-4xl mb-3">🚗</div>
                            <p>No drivers yet. Add your first driver above.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50">
                                        {["Name", "Phone", "Rickshaw No.", "NIT ID", "Status", "Availability", "Actions"].map(
                                            (h) => (
                                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                    {h}
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {drivers.map((driver) => (
                                        <tr key={driver._id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-800">
                                                {driver.name}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">{driver.phone}</td>
                                            <td className="px-4 py-3 text-slate-500">
                                                {driver.rickshawNumber}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">
                                                {driver.nitRegistrationId}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={driver.status} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${driver.isAvailable
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-slate-100 text-slate-500"
                                                        }`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full ${driver.isAvailable ? "bg-green-500" : "bg-slate-400"
                                                            }`}
                                                    />
                                                    {driver.isAvailable ? "Available" : "Offline"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {driver.status !== "approved" && (
                                                        <button
                                                            onClick={() => handleStatusChange(driver._id, "approved")}
                                                            disabled={actionLoading === driver._id + "approved"}
                                                            className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-60"
                                                        >
                                                            Approve
                                                        </button>
                                                    )}
                                                    {driver.status !== "suspended" && (
                                                        <button
                                                            onClick={() => handleStatusChange(driver._id, "suspended")}
                                                            disabled={actionLoading === driver._id + "suspended"}
                                                            className="px-2.5 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-60"
                                                        >
                                                            Suspend
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setResetModal({ id: driver._id, name: driver.name })}
                                                        className="p-1.5 text-slate-400 hover:text-orange-500 transition-colors"
                                                        title="Reset Password"
                                                    >
                                                        <KeyRound className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Reset Password Modal */}
            {resetModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Reset Password</h3>
                        <p className="text-sm text-slate-500 mb-5">
                            Setting new password for{" "}
                            <span className="font-semibold text-slate-700">{resetModal.name}</span>
                        </p>
                        <input
                            type="password"
                            placeholder="New password (min 6 characters)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 mb-4"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={handleResetPassword}
                                disabled={actionLoading === resetModal.id + "reset"}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-60"
                            >
                                {actionLoading ? <Spinner size="sm" /> : "Reset Password"}
                            </button>
                            <button
                                onClick={() => { setResetModal(null); setNewPassword(""); }}
                                className="flex-1 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 py-2.5"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
