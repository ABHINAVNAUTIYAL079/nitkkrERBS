"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Loader2, X, Search } from "lucide-react";

export interface LocationResult {
    label: string;
    lat: number;
    lng: number;
    type?: string;
}

interface Props {
    placeholder?: string;
    value: LocationResult | null;
    onChange: (result: LocationResult | null) => void;
    markerColor?: "green" | "red";
    id?: string;
}

// Bias search around Kurukshetra/Haryana but don't restrict it
const VIEWBOX = "76.60,29.75,77.10,30.15"; // wider box around Kurukshetra district

async function geocode(query: string): Promise<LocationResult[]> {
    if (!query || query.trim().length < 2) return [];
    try {
        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.searchParams.set("q", query);
        url.searchParams.set("format", "json");
        url.searchParams.set("limit", "6");
        url.searchParams.set("viewbox", VIEWBOX);
        url.searchParams.set("bounded", "0");         // allow outside viewbox
        url.searchParams.set("addressdetails", "1");

        const res = await fetch(url.toString(), {
            headers: { "Accept-Language": "en", "User-Agent": "NIT-KKR-ERickshaw/1.0" },
        });
        if (!res.ok) return [];
        const data: Array<{
            display_name: string;
            lat: string;
            lon: string;
            type: string;
            class: string;
        }> = await res.json();

        return data.map((item) => ({
            label: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            type: item.type || item.class,
        }));
    } catch {
        return [];
    }
}

function getTypeIcon(type?: string): string {
    if (!type) return "📍";
    const t = type.toLowerCase();
    if (t.includes("rail") || t.includes("station")) return "🚉";
    if (t.includes("bus") || t.includes("stop")) return "🚌";
    if (t.includes("hospital") || t.includes("clinic")) return "🏥";
    if (t.includes("school") || t.includes("university") || t.includes("college")) return "🏫";
    if (t.includes("hotel") || t.includes("hostel")) return "🏨";
    if (t.includes("restaurant") || t.includes("food")) return "🍽️";
    if (t.includes("park") || t.includes("garden")) return "🌳";
    if (t.includes("road") || t.includes("street") || t.includes("highway")) return "🛣️";
    if (t.includes("residential") || t.includes("house")) return "🏠";
    return "📍";
}

// Shorten long Nominatim labels for display
function shortLabel(label: string, maxLen = 55): string {
    if (label.length <= maxLen) return label;
    const parts = label.split(", ");
    // Keep first 2–3 parts which are usually the most descriptive
    return parts.slice(0, 3).join(", ") + (parts.length > 3 ? "…" : "");
}

export default function LocationSearch({ placeholder = "Search location…", value, onChange, markerColor = "green", id }: Props) {
    const [query, setQuery] = useState(value?.label ? shortLabel(value.label) : "");
    const [results, setResults] = useState<LocationResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Keep text in sync if external value cleared
    useEffect(() => {
        if (!value) setQuery("");
    }, [value]);

    const search = useCallback(async (q: string) => {
        if (q.trim().length < 2) { setResults([]); setOpen(false); return; }
        setLoading(true);
        const res = await geocode(q);
        setLoading(false);
        setResults(res);
        setOpen(res.length > 0);
    }, []);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const q = e.target.value;
        setQuery(q);
        if (value) onChange(null); // clear selection when user types again
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => search(q), 500);
    };

    const handleSelect = (result: LocationResult) => {
        setQuery(shortLabel(result.label));
        onChange(result);
        setOpen(false);
        setResults([]);
    };

    const handleClear = () => {
        setQuery("");
        onChange(null);
        setResults([]);
        setOpen(false);
        inputRef.current?.focus();
    };

    // Close dropdown on outside click
    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    const ringColor = markerColor === "green"
        ? "focus:ring-emerald-500 focus:border-emerald-500"
        : "focus:ring-red-500 focus:border-red-500";

    const pinColor = markerColor === "green" ? "text-emerald-400" : "text-red-400";

    return (
        <div ref={containerRef} className="relative" id={id}>
            {/* Input */}
            <div className="relative flex items-center">
                <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${pinColor} pointer-events-none z-10 shrink-0`} />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInput}
                    onFocus={() => { if (results.length > 0) setOpen(true); }}
                    placeholder={placeholder}
                    autoComplete="off"
                    className={`w-full pl-9 pr-9 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 transition-colors ${ringColor}`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {loading && <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />}
                    {!loading && query && (
                        <button onClick={handleClear} className="text-slate-500 hover:text-slate-300 transition-colors">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                    {!loading && !query && <Search className="w-3.5 h-3.5 text-slate-500" />}
                </div>
            </div>

            {/* Selected badge */}
            {value && (
                <div className={`mt-1.5 flex items-center gap-1.5 text-xs ${markerColor === "green" ? "text-emerald-400" : "text-red-400"}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current inline-block animate-pulse" />
                    <span className="truncate opacity-80">{shortLabel(value.label, 50)}</span>
                </div>
            )}

            {/* Dropdown */}
            {open && results.length > 0 && (
                <div className="absolute z-[9999] mt-1 w-full bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden">
                    {results.map((r, i) => (
                        <button
                            key={i}
                            onMouseDown={(e) => { e.preventDefault(); handleSelect(r); }}
                            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-left group border-b border-slate-700/50 last:border-none"
                        >
                            <span className="text-lg shrink-0 mt-0.5">{getTypeIcon(r.type)}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-medium leading-snug line-clamp-2">
                                    {shortLabel(r.label, 80)}
                                </p>
                                {r.type && (
                                    <p className="text-slate-500 text-xs mt-0.5 capitalize">{r.type.replace("_", " ")}</p>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {open && !loading && results.length === 0 && query.trim().length >= 2 && (
                <div className="absolute z-[9999] mt-1 w-full bg-slate-800 border border-slate-600 rounded-xl shadow-2xl px-4 py-3 text-slate-400 text-xs">
                    No results found. Try a different search term.
                </div>
            )}
        </div>
    );
}
