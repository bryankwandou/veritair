"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";
import { NetworkMap } from "@/components/network-map-client";

interface Pad {
  pda_address: string;
  name: string;
  kind: "public" | "housing";
  lat: number;
  lng: number;
}

interface Hub {
  pda_address: string;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
  active_drones: number;
  pads: Pad[];
}

export default function NetworkPage() {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hubs")
      .then((r) => r.json())
      .then((data) => setHubs(data.hubs ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <Reveal>
        <h1 className="text-3xl font-semibold tracking-tight">Hubs &amp; landing pads</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Every hub here launches drones toward its own set of landing pads — public pads for
          open areas, housing pads inside a gated perimeter.
        </p>
      </Reveal>

      {!loading && hubs.length > 0 && (
        <Reveal delay={0.05} className="mt-8">
          <NetworkMap
            hubs={hubs.map((h) => ({ pda_address: h.pda_address, name: h.name, lat: h.lat, lng: h.lng }))}
            pads={hubs.flatMap((h) => h.pads)}
          />
        </Reveal>
      )}

      <div className="mt-10 space-y-4">
        {loading && <p className="text-sm text-muted-foreground">Loading the network…</p>}
        {!loading && hubs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            No hubs registered yet. Open the operator console to register the first one.
          </div>
        )}
        {hubs.map((hub, i) => (
          <Reveal key={hub.pda_address} delay={i * 0.05}>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-medium">{hub.name}</h2>
                <span className="font-mono text-xs text-muted-foreground">
                  {hub.active_drones}/{hub.capacity} drones active
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {hub.pads.length === 0 && (
                  <span className="text-sm text-muted-foreground">No pads registered yet.</span>
                )}
                {hub.pads.map((pad) => (
                  <Badge key={pad.pda_address} variant={pad.kind === "housing" ? "secondary" : "outline"}>
                    {pad.name} · {pad.kind === "housing" ? "inside a community" : "open access"}
                  </Badge>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
