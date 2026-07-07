"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { Reveal } from "@/components/reveal";
import { solscanTxUrl } from "@/lib/solana/constants";

function Counter({ target }: { target: number }) {
  const value = useMotionValue(0);
  const rounded = useTransform(value, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    const controls = animate(value, target, { duration: 1.2, ease: "easeOut" });
    return controls.stop;
  }, [target, value]);

  return <motion.span>{rounded}</motion.span>;
}

interface Stats {
  hubs: number;
  pads: number;
  drones: number;
  orders: number;
  delivered: number;
  latest_tx: string | null;
}

export function NetworkStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => setStats(data.stats ?? null))
      .catch(() => setStats(null));
  }, []);

  if (!stats) return null;

  const items = [
    { label: "Hubs live", value: Number(stats.hubs) },
    { label: "Landing pads", value: Number(stats.pads) },
    { label: "Drones in fleet", value: Number(stats.drones) },
    { label: "Orders booked", value: Number(stats.orders) },
    { label: "Delivered", value: Number(stats.delivered) },
  ];

  return (
    <section className="mx-auto mt-24 max-w-5xl px-4">
      <Reveal>
        <div className="rounded-2xl border border-border bg-card px-6 py-8">
          <div className="grid grid-cols-2 gap-6 text-center sm:grid-cols-5">
            {items.map((item) => (
              <div key={item.label}>
                <p className="font-mono text-3xl font-semibold tabular-nums">
                  <Counter target={item.value} />
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
          {stats.latest_tx && (
            <p className="mt-6 text-center text-xs text-muted-foreground">
              These numbers come from the live database, and the most recent booking is{" "}
              <a
                href={solscanTxUrl(stats.latest_tx)}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-primary underline underline-offset-4"
              >
                {stats.latest_tx.slice(0, 10)}…
              </a>{" "}
              on Solscan.
            </p>
          )}
        </div>
      </Reveal>
    </section>
  );
}
