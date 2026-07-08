"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Raw Leaflet with a canvas renderer: 3,000+ points as React components
// would mean 3,000+ DOM nodes; on canvas they're just draw calls.
export function NationwideMap({
  pads,
  hubs,
  height = 480,
}: {
  pads: [number, number, number][]; // [lat, lng, housingFlag]
  hubs: [number, number, string][]; // [lat, lng, name]
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      preferCanvas: true,
      center: [-2.5, 118],
      zoom: 5,
      scrollWheelZoom: false,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const renderer = L.canvas({ padding: 0.3 });

    for (const [lat, lng, housing] of pads) {
      L.circleMarker([lat, lng], {
        renderer,
        radius: 2.5,
        stroke: false,
        fillColor: housing ? "#f59e0b" : "#2f6f8f",
        fillOpacity: 0.65,
      }).addTo(map);
    }

    for (const [lat, lng, name] of hubs) {
      L.circleMarker([lat, lng], {
        renderer,
        radius: 5,
        color: "#ffffff",
        weight: 1.5,
        fillColor: "#0f172a",
        fillOpacity: 1,
      })
        .bindTooltip(String(name))
        .addTo(map);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [pads, hubs]);

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className="overflow-hidden rounded-2xl border border-border"
    />
  );
}
