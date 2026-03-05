"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, X, Search, ChevronDown } from "lucide-react";

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

// ─────────────────────────────────────────────────────────────────────────────
// NIT KURUKSHETRA CAMPUS LOCATIONS
// ─────────────────────────────────────────────────────────────────────────────
const CAMPUS_LOCATIONS: LocationResult[] = [
    { label: "NIT Kurukshetra Main Gate",                       lat: 29.94781, lng: 76.82241, type: "gate" },
    { label: "NIT Market / Campus Market",                      lat: 29.94888, lng: 76.81814, type: "market" },
    { label: "Central Library, NIT Kurukshetra",                lat: 29.94738, lng: 76.81538, type: "library" },
    { label: "Sports Complex, NIT Kurukshetra",                 lat: 29.95062, lng: 76.81561, type: "sports" },
    { label: "Student Activity Center (SAC)",                   lat: 29.94539, lng: 76.81824, type: "sac" },
    { label: "Hostel 10, NIT Kurukshetra",                      lat: 29.94321, lng: 76.81750, type: "hostel" },
    { label: "MCA-MBA Department",                              lat: 29.94497, lng: 76.81596, type: "department" },
    { label: "Brahma Sarovar",                                  lat: 29.96887, lng: 76.83469, type: "places" },
    { label: "Pipli Mini Zoo",                                   lat: 29.98679, lng: 76.89226, type: "zoo" },
    { label: "Pipli Bus Stand",                                  lat: 29.98099, lng: 76.89277, type: "Bus stand" },
    { label: "Kessel Mall",                                     lat: 29.97053, lng: 76.83636, type: "Mall" },
    { label: "Divine Mall",                                     lat: 29.97510, lng: 76.86713, type: "Mall" },
    { label: "Sheikh Chilli Tomb",                              lat: 29.97685, lng: 76.82794, type: "Tomb" },
    { label: "Wine Shop Kurukshetra",                           lat: 29.97383, lng: 76.82662, type: "wine shop" },
    { label: "Railway Station",                                 lat: 29.96672, lng: 76.82499, type: "railway station" },
    { label: "Kurukshetra University",                          lat: 29.95634, lng: 76.81939, type: "University" },
    { label: "Jyothisar",                                       lat: 29.96206, lng: 76.77137, type: "jyothisar" },
    { label: "Kurukshetra Panorama & Science Centre",           lat: 29.96612, lng: 76.83384, type: "museum" },
    { label: "Krishna Garden Park",                             lat: 29.96345, lng: 76.83720, type: "park" },
    { label: "Shri Venkateswara Swamy Tirupati Balaji Temple",  lat: 29.95797, lng: 76.83464, type: "temple" },
    { label: "Multi Art Cultural Centre",                       lat: 29.95693, lng: 76.83370, type: "Art Center" },
    { label: "1857 War Museum",                                 lat: 29.96220, lng: 76.81978, type: "museum" },
    { label: "The Dharohar Haryana Cultural Museum",            lat: 29.96153, lng: 76.81877, type: "museum" },
    { label: "Jat Dharamshala",                                 lat: 29.96612, lng: 76.82698, type: "dharmashala" },
];

// Nominatim fallback for "Other" searches
const VIEWBOX = "76.60,29.75,77.10,30.15";
async function searchNominatim(query: string): Promise<LocationResult[]> {
    if (!query || query.trim().length < 2) return [];
    try {
        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.searchParams.set("q", query);
        url.searchParams.set("format", "json");
        url.searchParams.set("limit", "6");
        url.searchParams.set("viewbox", VIEWBOX);
        url.searchParams.set("bounded", "0");
        url.searchParams.set("addressdetails", "1");
        const res = await fetch(url.toString(), {
            headers: { "Accept-Language": "en", "User-Agent": "NIT-KKR-ERickshaw/1.0" },
        });
        if (!res.ok) return [];
        const data: Array<{ display_name: string; lat: string; lon: string; type: string; class: string }> =
            await res.json();
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

// Filter campus list locally
function searchCampus(query: string): LocationResult[] {
    if (!query || query.trim().length < 1) return CAMPUS_LOCATIONS;
    const q = query.trim().toLowerCase();
    return CAMPUS_LOCATIONS.filter((loc) => loc.label.toLowerCase().includes(q));
}

function getTypeIcon(type?: string): string {
    if (!type) return "📍";
    const t = type.toLowerCase();
    if (t === "gate")       return "�";
    if (t === "market")     return "�";
    if (t === "library")    return "📚";
    if (t === "sports")     return "⚽";
    if (t === "sac")        return "�";
    if (t === "hostel")     return "🏨";
    if (t === "department") return "�";
    if (t.includes("rail") || t.includes("station")) return "🚉";
    if (t.includes("bus"))  return "🚌";
    if (t.includes("hospital")) return "🏥";
    if (t.includes("road") || t.includes("highway")) return "🛣️";
    return "📍";
}

function shortLabel(label: string, maxLen = 55): string {
    if (label.length <= maxLen) return label;
    const parts = label.split(", ");
    return parts.slice(0, 3).join(", ") + (parts.length > 3 ? "…" : "");
}

// ─── Mode: "campus" = browsing campus list | "other" = free Nominatim search ───
type Mode = "campus" | "other";

export default function LocationSearch({
    placeholder = "Select location…",
    value,
    onChange,
    markerColor = "green",
    id,
}: Props) {
    const [query, setQuery]         = useState(value?.label ? shortLabel(value.label) : "");
    const [results, setResults]     = useState<LocationResult[]>([]);
    const [otherResults, setOtherResults] = useState<LocationResult[]>([]);
    const [mode, setMode]           = useState<Mode>("campus");
    const [open, setOpen]           = useState(false);
    const [loadingOther, setLoadingOther] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inputRef    = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Keep text in sync if external value cleared
    useEffect(() => { if (!value) { setQuery(""); setMode("campus"); } }, [value]);

    // Campus filter on query change
    useEffect(() => {
        if (mode === "campus") {
            setResults(searchCampus(query));
        }
    }, [query, mode]);

    // Nominatim search when in "other" mode
    const runOtherSearch = useCallback(async (q: string) => {
        if (q.trim().length < 2) { setOtherResults([]); return; }
        setLoadingOther(true);
        const res = await searchNominatim(q);
        setLoadingOther(false);
        setOtherResults(res);
        setOpen(true); // ensure dropdown is visible after results arrive
    }, []);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const q = e.target.value;
        setQuery(q);
        setOpen(true); // keep dropdown open while typing
        if (value) onChange(null);
        if (mode === "other") {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => runOtherSearch(q), 500);
        }
    };

    const handleFocus = () => {
        setOpen(true);
        if (mode === "campus") setResults(searchCampus(query));
    };

    const handleSelect = (result: LocationResult) => {
        setQuery(shortLabel(result.label));
        onChange(result);
        setOpen(false);
        setResults([]);
        setOtherResults([]);
    };

    const handleClear = () => {
        setQuery("");
        onChange(null);
        setResults(CAMPUS_LOCATIONS);
        setOtherResults([]);
        setMode("campus");
        setOpen(false);
        inputRef.current?.focus();
    };

    const switchToOther = () => {
        setMode("other");
        setQuery("");
        onChange(null);
        setOtherResults([]);
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const switchToCampus = () => {
        setMode("campus");
        setQuery("");
        onChange(null);
        setResults(CAMPUS_LOCATIONS);
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    // Close on outside click
    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    const ringColor  = markerColor === "green"
        ? "focus:ring-emerald-500 focus:border-emerald-500"
        : "focus:ring-red-500 focus:border-red-500";
    const pinColor   = markerColor === "green" ? "text-emerald-400" : "text-red-400";
    const accentText = markerColor === "green" ? "text-emerald-400" : "text-red-400";

    const campusResults = mode === "campus" ? results : [];
    const showOtherResults = mode === "other" && otherResults.length > 0;
    const showDropdown = open;

    return (
        <div ref={containerRef} className="relative" id={id}>
            {/* Mode badge */}
            {mode === "other" && (
                <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/30 rounded-full px-2 py-0.5">
                        🔍 Searching outside campus
                    </span>
                    <button
                        type="button"
                        onClick={switchToCampus}
                        className="text-xs text-slate-400 hover:text-slate-200 underline transition-colors"
                    >
                        ← Back to campus
                    </button>
                </div>
            )}

            {/* Input */}
            <div className="relative flex items-center">
                <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${pinColor} pointer-events-none z-10 shrink-0`} />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInput}
                    onFocus={handleFocus}
                    placeholder={mode === "other" ? "Type any location to search…" : placeholder}
                    autoComplete="off"
                    className={`w-full pl-9 pr-9 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 transition-colors ${ringColor}`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {loadingOther && (
                        <svg className="w-3.5 h-3.5 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                    )}
                    {!loadingOther && value && (
                        <button onClick={handleClear} type="button" className="text-slate-500 hover:text-slate-300 transition-colors">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                    {!loadingOther && !value && (
                        <ChevronDown className={`w-3.5 h-3.5 ${pinColor} transition-transform ${open ? "rotate-180" : ""}`} />
                    )}
                </div>
            </div>

            {/* Selected badge */}
            {value && (
                <div className={`mt-1.5 flex items-center gap-1.5 text-xs ${accentText}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current inline-block animate-pulse" />
                    <span className="truncate opacity-80">{shortLabel(value.label, 50)}</span>
                </div>
            )}

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute z-[9999] mt-1 w-full bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-y-auto max-h-64">

                    {/* Campus list */}
                    {mode === "campus" && (
                        <>
                            {campusResults.length > 0 ? (
                                <>
                                    <div className="px-3 pt-2 pb-1">
                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Campus Locations</p>
                                    </div>
                                    {campusResults.map((r, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onMouseDown={(e) => { e.preventDefault(); handleSelect(r); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700 transition-colors text-left border-b border-slate-700/50 last:border-none"
                                        >
                                            <span className="text-base shrink-0">{getTypeIcon(r.type)}</span>
                                            <span className="text-white text-xs font-medium truncate">{r.label}</span>
                                        </button>
                                    ))}
                                </>
                            ) : (
                                <div className="px-4 py-3 text-slate-400 text-xs">No campus location matches.</div>
                            )}

                            {/* Other option always at the bottom */}
                            <button
                                type="button"
                                onMouseDown={(e) => { e.preventDefault(); switchToOther(); }}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-slate-700/50 hover:bg-slate-600/60 transition-colors text-left border-t border-slate-600"
                            >
                                <span className="text-base shrink-0">🔍</span>
                                <div>
                                    <p className="text-amber-300 text-xs font-semibold">Other location…</p>
                                    <p className="text-slate-400 text-xs">Search any place outside campus</p>
                                </div>
                            </button>
                        </>
                    )}

                    {/* Nominatim results when in "other" mode */}
                    {mode === "other" && (
                        <>
                            {query.trim().length < 2 && !loadingOther && (
                                <div className="px-4 py-3 text-slate-400 text-xs">Start typing to search any location…</div>
                            )}
                            {showOtherResults && otherResults.map((r, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onMouseDown={(e) => { e.preventDefault(); handleSelect(r); }}
                                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-left border-b border-slate-700/50 last:border-none"
                                >
                                    <span className="text-base shrink-0 mt-0.5">{getTypeIcon(r.type)}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-xs font-medium leading-snug line-clamp-2">{shortLabel(r.label, 80)}</p>
                                        {r.type && <p className="text-slate-500 text-xs mt-0.5 capitalize">{r.type.replace("_", " ")}</p>}
                                    </div>
                                </button>
                            ))}
                            {mode === "other" && !loadingOther && query.trim().length >= 2 && otherResults.length === 0 && (
                                <div className="px-4 py-3 text-slate-400 text-xs">No results found. Try a different search term.</div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
