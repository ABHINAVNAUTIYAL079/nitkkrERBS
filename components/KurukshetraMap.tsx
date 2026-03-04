"use client";
import { useEffect, useRef } from "react";

// NIT KKR campus centre
const NIT_KKR = { lat: 29.9470, lng: 76.8180 };

// Kurukshetra district bounding box — map cannot pan/zoom outside this
const KKR_BOUNDS: [[number, number], [number, number]] = [
    [29.75, 76.60], // SW corner
    [30.15, 77.10], // NE corner
];

export interface RouteInfo {
    distanceKm: number;
    durationMin: number;
}

interface CoordPoint {
    lat: number;
    lng: number;
    label: string;
}

interface Props {
    pickupCoords?: CoordPoint | null;
    dropCoords?: CoordPoint | null;
    onRouteReady?: (info: RouteInfo) => void;
    height?: string;
}

// Inject Leaflet CSS + JS from CDN once
function ensureLeafletLoaded(): Promise<void> {
    return new Promise((resolve) => {
        if ((window as any).L) { resolve(); return; }

        if (!document.querySelector("#leaflet-css")) {
            const link = document.createElement("link");
            link.id = "leaflet-css";
            link.rel = "stylesheet";
            link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
            document.head.appendChild(link);
        }

        if (!document.querySelector("#leaflet-js")) {
            const script = document.createElement("script");
            script.id = "leaflet-js";
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
            script.onload = () => resolve();
            document.head.appendChild(script);
        } else {
            const poll = setInterval(() => {
                if ((window as any).L) { clearInterval(poll); resolve(); }
            }, 50);
        }
    });
}

// Fetch road route + distance from OSRM public demo server
async function fetchRoadRoute(
    from: [number, number],
    to: [number, number]
): Promise<{ coords: [number, number][]; distanceM: number; durationS: number } | null> {
    try {
        const url =
            `https://router.project-osrm.org/route/v1/driving/` +
            `${from[1]},${from[0]};${to[1]},${to[0]}` +
            `?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        if (data.code !== "Ok" || !data.routes?.[0]) return null;
        const route = data.routes[0];
        const coords: [number, number][] = route.geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]] as [number, number]
        );
        return {
            coords,
            distanceM: route.legs[0]?.distance ?? 0,
            durationS: route.legs[0]?.duration ?? 0,
        };
    } catch {
        return null;
    }
}

function makePinIcon(L: any, color: "green" | "red", emoji: string) {
    const bg = color === "green"
        ? "linear-gradient(135deg,#22c55e,#16a34a)"
        : "linear-gradient(135deg,#ef4444,#dc2626)";
    const shadow = color === "green"
        ? "rgba(34,197,94,0.6)"
        : "rgba(239,68,68,0.6)";
    return L.divIcon({
        html: `<div style="background:${bg};width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 14px ${shadow};"><span style="transform:rotate(45deg);display:block;text-align:center;line-height:28px;font-size:14px;">${emoji}</span></div>`,
        className: "",
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -36],
    });
}

export default function KurukshetraMap({ pickupCoords, dropCoords, onRouteReady, height = "420px" }: Props) {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const routeLayerRef = useRef<any>(null);
    const distanceLabelRef = useRef<any>(null);
    const onRouteReadyRef = useRef(onRouteReady);

    // Keep callback ref fresh without re-triggering effects
    useEffect(() => { onRouteReadyRef.current = onRouteReady; }, [onRouteReady]);

    // Init map once on mount
    useEffect(() => {
        if (typeof window === "undefined" || !mapRef.current) return;
        if (leafletMap.current) return;

        ensureLeafletLoaded().then(() => {
            const L = (window as any).L;

            const map = L.map(mapRef.current, {
                center: [NIT_KKR.lat, NIT_KKR.lng],
                zoom: 13,
                minZoom: 11,
                maxZoom: 19,
                zoomControl: true,
                scrollWheelZoom: true,
                maxBounds: KKR_BOUNDS,
                maxBoundsViscosity: 1.0, // hard stop — map won't pan outside bounds
            });

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            }).addTo(map);


            leafletMap.current = map;
        });

        return () => {
            if (leafletMap.current) {
                leafletMap.current.remove();
                leafletMap.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // React to coordinate changes — draw markers and route
    useEffect(() => {
        if (!leafletMap.current || typeof window === "undefined") return;
        let cancelled = false;

        ensureLeafletLoaded().then(async () => {
            const L = (window as any).L;

            // Clear previous dynamic layers
            markersRef.current.forEach((m) => m.remove());
            markersRef.current = [];
            if (routeLayerRef.current) { routeLayerRef.current.remove(); routeLayerRef.current = null; }
            if (distanceLabelRef.current) { distanceLabelRef.current.remove(); distanceLabelRef.current = null; }

            const points: [number, number][] = [];

            if (pickupCoords) {
                const { lat, lng, label } = pickupCoords;
                const marker = L.marker([lat, lng], { icon: makePinIcon(L, "green", "🟢") })
                    .addTo(leafletMap.current)
                    .bindPopup(`<b>🟢 Pickup</b><br><small>${label.slice(0, 60)}…</small>`, { maxWidth: 220 })
                    .openPopup();
                markersRef.current.push(marker);
                points.push([lat, lng]);
            }

            if (dropCoords) {
                const { lat, lng, label } = dropCoords;
                const marker = L.marker([lat, lng], { icon: makePinIcon(L, "red", "🔴") })
                    .addTo(leafletMap.current)
                    .bindPopup(`<b>🔴 Drop</b><br><small>${label.slice(0, 60)}…</small>`, { maxWidth: 220 });
                markersRef.current.push(marker);
                points.push([lat, lng]);
            }

            if (points.length === 2) {
                const result = await fetchRoadRoute(points[0], points[1]);
                if (cancelled) return;

                const routePath = result?.coords ?? points;
                const isFallback = !result;

                routeLayerRef.current = L.polyline(routePath, {
                    color: "#f97316",
                    weight: 5,
                    opacity: 0.9,
                    dashArray: isFallback ? "8 6" : undefined,
                    lineCap: "round",
                    lineJoin: "round",
                }).addTo(leafletMap.current);

                leafletMap.current.fitBounds(
                    L.latLngBounds(routePath),
                    { padding: [60, 60], animate: true }
                );

                if (result && !isFallback) {
                    const km = result.distanceM / 1000;
                    const mins = Math.round(result.durationS / 60);
                    onRouteReadyRef.current?.({ distanceKm: km, durationMin: mins });

                    // Show distance bubble at midpoint of route
                    const mid = routePath[Math.floor(routePath.length / 2)];
                    distanceLabelRef.current = L.marker(mid, {
                        icon: L.divIcon({
                            html: `<div style="background:#1e293b;border:1px solid #f97316;border-radius:8px;padding:3px 8px;white-space:nowrap;font-size:11px;font-weight:700;color:#fb923c;box-shadow:0 2px 8px rgba(0,0,0,0.5);">📏 ${km.toFixed(1)} km · ~${mins} min</div>`,
                            className: "",
                            iconAnchor: [40, 12],
                        }),
                    }).addTo(leafletMap.current);
                } else {
                    // Straight-line fallback — estimate distance with Haversine
                    const R = 6371;
                    const dLat = (points[1][0] - points[0][0]) * Math.PI / 180;
                    const dLon = (points[1][1] - points[0][1]) * Math.PI / 180;
                    const a = Math.sin(dLat / 2) ** 2 +
                        Math.cos(points[0][0] * Math.PI / 180) *
                        Math.cos(points[1][0] * Math.PI / 180) *
                        Math.sin(dLon / 2) ** 2;
                    const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    onRouteReadyRef.current?.({ distanceKm: km, durationMin: Math.round(km * 3) });
                }
            } else if (points.length === 1) {
                leafletMap.current.setView(points[0], 16, { animate: true });
            } else {
                // No points — reset to NIT KKR
                leafletMap.current.setView([NIT_KKR.lat, NIT_KKR.lng], 13, { animate: true });
            }
        });

        return () => { cancelled = true; };
    }, [pickupCoords, dropCoords]);

    return (
        <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl" style={{ height }}>
            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

            {/* Legend */}
            <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 space-y-1 pointer-events-none">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Pickup</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Drop</div>
                <div className="flex items-center gap-2">
                    <svg width="20" height="4" viewBox="0 0 20 4" className="inline-block"><line x1="0" y1="2" x2="20" y2="2" stroke="#f97316" strokeWidth="2.5" /></svg>
                    Route
                </div>
            </div>


        </div>
    );
}
