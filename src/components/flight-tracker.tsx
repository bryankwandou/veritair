"use client";

import { useEffect, useMemo, useState } from "react";
import { NetworkMap } from "@/components/network-map-client";
import { estimateFlight } from "@/lib/solana/flight";

// The drone's position here is a simulation driven by the order's status
// timestamps — there is no hardware feed behind it, and the panel says so
// on-screen. What it demonstrates is the tracking UX a real fleet feed
// would plug into.
export function FlightTracker({
  hubLat,
  hubLng,
  padLat,
  padLng,
  hubName,
  padName,
  status,
  statusChangedAt,
}: {
  hubLat: number;
  hubLng: number;
  padLat: number;
  padLng: number;
  hubName: string;
  padName: string;
  status: string;
  statusChangedAt: string;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (status !== "InFlight") return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [status]);

  const flight = useMemo(
    () => estimateFlight(hubLat, hubLng, padLat, padLng),
    [hubLat, hubLng, padLat, padLng]
  );

  const progress = useMemo(() => {
    if (status === "Booked" || status === "Assigned") return 0;
    if (status !== "InFlight") return 1;
    const elapsedMin = (now - new Date(statusChangedAt).getTime()) / 60_000;
    // Hold at 97% until the operator actually marks arrival — the simulation
    // never claims a landing that hasn't been recorded.
    return Math.min(Math.max(elapsedMin / flight.etaMinutes, 0.02), 0.97);
  }, [status, statusChangedAt, now, flight.etaMinutes]);

  const dronePosition: [number, number] = [
    hubLat + (padLat - hubLat) * progress,
    hubLng + (padLng - hubLng) * progress,
  ];

  const remainingMin = Math.max(Math.ceil(flight.etaMinutes * (1 - progress)), 1);

  return (
    <div className="space-y-3">
      <NetworkMap
        hubs={[{ pda_address: "hub", name: hubName, lat: hubLat, lng: hubLng }]}
        pads={[{ pda_address: "pad", name: padName, lat: padLat, lng: padLng, kind: "public" }]}
        route={[[hubLat, hubLng], [padLat, padLng]]}
        dronePosition={status === "Booked" || status === "Assigned" ? undefined : dronePosition}
        height={280}
      />
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted px-4 py-2 text-sm">
        <span className="text-muted-foreground">
          {status === "InFlight"
            ? "In flight — simulated position, updates every second"
            : status === "Booked" || status === "Assigned"
              ? "Waiting at the hub"
              : "At the landing pad"}
        </span>
        <span className="font-mono tabular-nums">
          {flight.distanceKm.toFixed(1)} km
          {status === "InFlight" && ` · ~${remainingMin} min left`}
        </span>
      </div>
    </div>
  );
}
