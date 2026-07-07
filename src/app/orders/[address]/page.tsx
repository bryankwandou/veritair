"use client";

import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/reveal";
import { formatSol } from "@/lib/solana/pricing";
import { solscanTxUrl, ORDER_STATUSES } from "@/lib/solana/constants";
import { FlightTracker } from "@/components/flight-tracker";

interface OrderDetail {
  pda_address: string;
  hub_name: string;
  pad_name: string;
  weight_grams: number;
  price_lamports: number;
  status: string;
  attempt_count: number;
  last_tx_signature: string;
  hub_lat: number;
  hub_lng: number;
  pad_lat: number;
  pad_lng: number;
  updated_at: string;
}

export default function OrderDetailPage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch(`/api/orders/${address}`);
    const data = await res.json();
    setOrder(data.order ?? null);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // Keep the page current while the order is still moving — a recipient
    // watching this screen shouldn't need to refresh to see arrival.
    const id = setInterval(() => {
      setOrder((current) => {
        if (current && ["Delivered", "Cancelled", "Expired"].includes(current.status)) return current;
        load();
        return current;
      });
    }, 10_000);
    return () => clearInterval(id);
  }, [address]);

  async function confirmDelivery() {
    setMessage("");
    const res = await fetch(`/api/orders/${address}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "confirm", code }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Delivery confirmed. Escrow released.");
    } else {
      setMessage(data.message ?? "That code doesn't match.");
    }
    await load();
  }

  if (loading) {
    return <div className="mx-auto max-w-lg px-4 py-24 text-center text-muted-foreground">Loading order…</div>;
  }

  if (!order) {
    return <div className="mx-auto max-w-lg px-4 py-24 text-center text-muted-foreground">Order not found.</div>;
  }

  const stepIndex = ORDER_STATUSES.indexOf(order.status as (typeof ORDER_STATUSES)[number]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Reveal>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            {order.hub_name} → {order.pad_name}
          </h1>
          <Badge variant="secondary">{order.status}</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {order.weight_grams.toLocaleString()} g · {formatSol(order.price_lamports)}
        </p>
      </Reveal>

      <Reveal delay={0.05} className="mt-8 flex gap-1">
        {["Booked", "Assigned", "InFlight", "Arrived", "Delivered"].map((s, i) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= stepIndex ? "bg-primary" : "bg-muted"}`} />
        ))}
      </Reveal>

      {order.hub_lat != null && order.pad_lat != null && (
        <Reveal delay={0.08} className="mt-8">
          <FlightTracker
            hubLat={order.hub_lat}
            hubLng={order.hub_lng}
            padLat={order.pad_lat}
            padLng={order.pad_lng}
            hubName={order.hub_name}
            padName={order.pad_name}
            status={order.status}
            statusChangedAt={order.updated_at}
          />
        </Reveal>
      )}

      {order.status === "Arrived" || order.status === "Locked" ? (
        <Reveal delay={0.1} className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-medium">Confirm delivery</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the delivery code, or the last 4 digits of the recipient&apos;s phone number.
          </p>
          <div className="mt-4 flex gap-2">
            <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Code" />
            <Button onClick={confirmDelivery} disabled={order.status === "Locked"}>
              Confirm
            </Button>
          </div>
          {order.status === "Locked" && (
            <p className="mt-2 text-sm text-destructive">
              Too many wrong attempts — a hub operator needs to unlock this order.
            </p>
          )}
          {message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}
        </Reveal>
      ) : null}

      {order.last_tx_signature && (
        <Reveal delay={0.15} className="mt-8">
          <a
            href={solscanTxUrl(order.last_tx_signature)}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-primary underline underline-offset-4"
          >
            View the latest transaction on Solscan
          </a>
        </Reveal>
      )}
    </div>
  );
}
