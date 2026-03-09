"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker, Polyline } from "@react-google-maps/api";

const MAP_CONTAINER_STYLE = { width: "100%", height: "100%", borderRadius: "16px" };

const DRIVER_ICON = {
    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" fill="#ef4444" stroke="#fff" stroke-width="3"/>
            <text x="20" y="26" text-anchor="middle" font-size="18">🛺</text>
        </svg>`
    ),
    scaledSize: { width: 44, height: 44 },
    anchor: { x: 22, y: 22 },
};

const USER_ICON = {
    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" fill="#22c55e" stroke="#fff" stroke-width="3"/>
            <text x="20" y="26" text-anchor="middle" font-size="16">📍</text>
        </svg>`
    ),
    scaledSize: { width: 40, height: 40 },
    anchor: { x: 20, y: 20 },
};

// NIT KKR campus center as default
const DEFAULT_CENTER = { lat: 29.9490, lng: 76.8182 };

export default function TrackingMap({ driverLocation, userLocation, className = "" }) {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    });
    const mapRef = useRef(null);
    const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
    }, []);

    // Auto-fit bounds when both locations are available
    useEffect(() => {
        if (!mapRef.current) return;
        const map = mapRef.current;

        if (driverLocation?.lat && userLocation?.lat) {
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend({ lat: driverLocation.lat, lng: driverLocation.lng });
            bounds.extend({ lat: userLocation.lat, lng: userLocation.lng });
            map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
        } else if (driverLocation?.lat) {
            setMapCenter({ lat: driverLocation.lat, lng: driverLocation.lng });
        } else if (userLocation?.lat) {
            setMapCenter({ lat: userLocation.lat, lng: userLocation.lng });
        }
    }, [driverLocation, userLocation]);

    if (!isLoaded) {
        return (
            <div className={`flex items-center justify-center bg-slate-800/60 border border-slate-700 rounded-2xl ${className}`} style={{ minHeight: "300px" }}>
                <div className="text-center text-slate-400">
                    <div className="text-3xl mb-2">🗺️</div>
                    <p className="text-sm">Loading map...</p>
                </div>
            </div>
        );
    }

    const pathCoords =
        driverLocation?.lat && userLocation?.lat
            ? [
                { lat: driverLocation.lat, lng: driverLocation.lng },
                { lat: userLocation.lat, lng: userLocation.lng },
            ]
            : [];

    return (
        <div className={`relative rounded-2xl overflow-hidden ${className}`} style={{ minHeight: "300px" }}>
            <GoogleMap
                mapContainerStyle={MAP_CONTAINER_STYLE}
                zoom={15}
                center={mapCenter}
                onLoad={onMapLoad}
                options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: false,
                    styles: [
                        { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
                        { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
                        { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
                        { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
                        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#255763" }] },
                        { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
                        { featureType: "poi", elementType: "geometry", stylers: [{ color: "#283d6a" }] },
                        { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#023e58" }] },
                    ],
                }}
            >
                {/* Driver marker */}
                {driverLocation?.lat && (
                    <Marker
                        position={{ lat: driverLocation.lat, lng: driverLocation.lng }}
                        icon={DRIVER_ICON}
                        title="Driver"
                    />
                )}

                {/* User marker */}
                {userLocation?.lat && (
                    <Marker
                        position={{ lat: userLocation.lat, lng: userLocation.lng }}
                        icon={USER_ICON}
                        title="Your Location"
                    />
                )}

                {/* Dashed line connecting driver and user */}
                {pathCoords.length === 2 && (
                    <Polyline
                        path={pathCoords}
                        options={{
                            strokeColor: "#fbbf24",
                            strokeOpacity: 0.8,
                            strokeWeight: 3,
                            icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 }, offset: "0", repeat: "15px" }],
                        }}
                    />
                )}
            </GoogleMap>
        </div>
    );
}
