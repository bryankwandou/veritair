"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Leaflet's default marker icons reference image files by URL that don't
// resolve correctly under Next.js bundling — rebuilding them with plain
// divIcon markup sidesteps that instead of fighting the asset pipeline.
function dotIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,0.15)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

const hubIcon = dotIcon("var(--color-primary, #2f6f8f)");
const padIcon = dotIcon("#94a3b8");

export interface MapHub {
  pda_address: string;
  name: string;
  lat: number;
  lng: number;
}
export interface MapPad {
  pda_address: string;
  name: string;
  lat: number;
  lng: number;
  kind: string;
}

export function NetworkMap({
  hubs,
  pads,
  route,
  height = 360,
}: {
  hubs: MapHub[];
  pads: MapPad[];
  route?: [[number, number], [number, number]];
  height?: number;
}) {
  const points = [...hubs, ...pads];
  const center: [number, number] =
    points.length > 0
      ? [points[0].lat, points[0].lng]
      : [-6.2, 106.8];

  return (
    <div style={{ height }} className="overflow-hidden rounded-2xl border border-border">
      <MapContainer center={center} zoom={11} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hubs.map((h) => (
          <Marker key={h.pda_address} position={[h.lat, h.lng]} icon={hubIcon}>
            <Popup>{h.name} — Hub</Popup>
          </Marker>
        ))}
        {pads.map((p) => (
          <Marker key={p.pda_address} position={[p.lat, p.lng]} icon={padIcon}>
            <Popup>
              {p.name} — {p.kind === "housing" ? "Housing pad" : "Public pad"}
            </Popup>
          </Marker>
        ))}
        {route && <Polyline positions={route} pathOptions={{ color: "#2f6f8f", dashArray: "6 6" }} />}
      </MapContainer>
    </div>
  );
}
