"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { NationwideMap } from "@/components/nationwide-map-client";

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
  const [points, setPoints] = useState<{
    pads: [number, number, number][];
    hubs: [number, number, string][];
  } | null>(null);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/network/points")
      .then((r) => r.json())
      .then(setPoints)
      .catch(() => setPoints(null));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const id = setTimeout(() => {
      setLoading(true);
      fetch(`/api/hubs?limit=12${query ? `&q=${encodeURIComponent(query)}` : ""}`, {
        signal: controller.signal,
      })
        .then((r) => r.json())
        .then((data) => setHubs(data.hubs ?? []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250);
    return () => {
      controller.abort();
      clearTimeout(id);
    };
  }, [query]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <Reveal>
        <h1 className="text-3xl font-semibold tracking-tight">The network</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {points
            ? `${points.hubs.length} hubs and ${points.pads.length.toLocaleString()} landing pads across the country. `
            : ""}
          Every pad sits within a short flight of its city hub — public pads in open areas,
          housing pads inside gated perimeters. Dark dots are hubs; blue pads are public,
          amber pads are housing.
        </p>
      </Reveal>

      {points && (
        <Reveal delay={0.05} className="mt-8">
          <NationwideMap pads={points.pads} hubs={points.hubs} />
        </Reveal>
      )}

      <Reveal delay={0.1} className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Find a hub</h2>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a city — Makassar, Medan, Jayapura…"
            className="w-full sm:w-80"
          />
        </div>
      </Reveal>

      <div className="mt-6 space-y-4">
        {loading && <p className="text-sm text-muted-foreground">Searching…</p>}
        {!loading && hubs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            No hub matches that search.
          </div>
        )}
        {!loading &&
          hubs.map((hub, i) => (
            <Reveal key={hub.pda_address} delay={i * 0.03}>
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-medium">{hub.name}</h3>
                  <span className="font-mono text-xs text-muted-foreground">
                    {hub.active_drones}/{hub.capacity} drones · {hub.pads.length} pads
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {hub.pads.slice(0, 10).map((pad) => (
                    <Badge key={pad.pda_address} variant={pad.kind === "housing" ? "secondary" : "outline"}>
                      {pad.name}
                    </Badge>
                  ))}
                  {hub.pads.length > 10 && (
                    <Badge variant="outline">+{hub.pads.length - 10} more</Badge>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
      </div>
    </div>
  );
}
