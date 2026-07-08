"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/reveal";
import { formatSol } from "@/lib/solana/pricing";

interface Pad {
  pda_address: string;
  name: string;
  kind: string;
}
interface Hub {
  pda_address: string;
  name: string;
  capacity: number;
  active_drones: number;
  pads: Pad[];
}
interface OrderRow {
  pda_address: string;
  hub_name: string;
  pad_name: string;
  status: string;
  price_lamports: number;
  hub_authority: string;
}

export default function OperatorPage() {
  const { publicKey } = useWallet();
  const { setVisible } = useWalletModal();

  const [hubs, setHubs] = useState<Hub[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [hubForm, setHubForm] = useState({ name: "", lat: "", lng: "", capacity: "3" });
  const [padForm, setPadForm] = useState({ hubPda: "", name: "", lat: "", lng: "", kind: "public" });
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const [hubsRes, ordersRes] = await Promise.all([
      fetch("/api/hubs?light=1&limit=300").then((r) => r.json()),
      publicKey ? fetch(`/api/operator/orders`).then((r) => r.json()) : Promise.resolve({ orders: [] }),
    ]);
    setHubs(hubsRes.hubs ?? []);
    setOrders(ordersRes.orders ?? []);
  }

  useEffect(() => {
    refresh();
  }, [publicKey]);

  async function registerHub() {
    if (!publicKey) return setVisible(true);
    setBusy(true);
    await fetch("/api/operator/hubs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authorityWallet: publicKey.toBase58(),
        name: hubForm.name,
        lat: parseFloat(hubForm.lat),
        lng: parseFloat(hubForm.lng),
        capacity: parseInt(hubForm.capacity, 10),
      }),
    });
    setHubForm({ name: "", lat: "", lng: "", capacity: "3" });
    await refresh();
    setBusy(false);
  }

  async function registerPad() {
    if (!padForm.hubPda) return;
    setBusy(true);
    await fetch("/api/operator/pads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hubPda: padForm.hubPda,
        name: padForm.name,
        lat: parseFloat(padForm.lat),
        lng: parseFloat(padForm.lng),
        kind: padForm.kind,
      }),
    });
    setPadForm({ hubPda: "", name: "", lat: "", lng: "", kind: "public" });
    await refresh();
    setBusy(false);
  }

  async function registerDrone(hubPda: string) {
    setBusy(true);
    await fetch("/api/operator/drones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hubPda }),
    });
    await refresh();
    setBusy(false);
  }

  async function transition(orderPda: string, action: string) {
    setBusy(true);
    await fetch(`/api/orders/${orderPda}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    await refresh();
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <Reveal>
        <h1 className="text-3xl font-semibold tracking-tight">Operator console</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Register a hub and its pads, add drones to the fleet, and move an order from booked
          through to delivered — everything a hub authority needs to run their side of the
          network.
        </p>
        {!publicKey && (
          <Button className="mt-4" onClick={() => setVisible(true)}>
            Connect wallet
          </Button>
        )}
      </Reveal>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Reveal className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-medium">Register a hub</h2>
          <div className="mt-4 space-y-3">
            <div>
              <Label htmlFor="hub-name">Name</Label>
              <Input id="hub-name" value={hubForm.name} onChange={(e) => setHubForm({ ...hubForm, name: e.target.value })} placeholder="Ridgeline Hub" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="hub-lat">Latitude</Label>
                <Input id="hub-lat" value={hubForm.lat} onChange={(e) => setHubForm({ ...hubForm, lat: e.target.value })} placeholder="-6.20" />
              </div>
              <div>
                <Label htmlFor="hub-lng">Longitude</Label>
                <Input id="hub-lng" value={hubForm.lng} onChange={(e) => setHubForm({ ...hubForm, lng: e.target.value })} placeholder="106.84" />
              </div>
            </div>
            <div>
              <Label htmlFor="hub-cap">Drone capacity</Label>
              <Input id="hub-cap" value={hubForm.capacity} onChange={(e) => setHubForm({ ...hubForm, capacity: e.target.value })} />
            </div>
            <Button className="w-full" disabled={busy || !hubForm.name} onClick={registerHub}>
              Register hub
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.05} className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-medium">Register a landing pad</h2>
          <div className="mt-4 space-y-3">
            <div>
              <Label htmlFor="pad-hub">Hub</Label>
              <select
                id="pad-hub"
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={padForm.hubPda}
                onChange={(e) => setPadForm({ ...padForm, hubPda: e.target.value })}
              >
                <option value="">Select a hub…</option>
                {hubs.map((h) => (
                  <option key={h.pda_address} value={h.pda_address}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="pad-name">Name</Label>
              <Input id="pad-name" value={padForm.name} onChange={(e) => setPadForm({ ...padForm, name: e.target.value })} placeholder="Cedar Court" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pad-lat">Latitude</Label>
                <Input id="pad-lat" value={padForm.lat} onChange={(e) => setPadForm({ ...padForm, lat: e.target.value })} placeholder="-6.21" />
              </div>
              <div>
                <Label htmlFor="pad-lng">Longitude</Label>
                <Input id="pad-lng" value={padForm.lng} onChange={(e) => setPadForm({ ...padForm, lng: e.target.value })} placeholder="106.85" />
              </div>
            </div>
            <div>
              <Label htmlFor="pad-kind">Kind</Label>
              <select
                id="pad-kind"
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={padForm.kind}
                onChange={(e) => setPadForm({ ...padForm, kind: e.target.value })}
              >
                <option value="public">Public</option>
                <option value="housing">Housing</option>
              </select>
            </div>
            <Button className="w-full" disabled={busy || !padForm.hubPda || !padForm.name} onClick={registerPad}>
              Register pad
            </Button>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.1} className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-medium">Fleet</h2>
        <div className="mt-4 space-y-3">
          {hubs.map((h) => (
            <div key={h.pda_address} className="flex items-center justify-between rounded-lg bg-muted p-3">
              <span className="text-sm">
                {h.name} — {h.active_drones}/{h.capacity} drones
              </span>
              <Button size="sm" variant="outline" disabled={busy || h.active_drones >= h.capacity} onClick={() => registerDrone(h.pda_address)}>
                Add drone
              </Button>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.15} className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-medium">Orders in your hubs</h2>
        <div className="mt-4 space-y-3">
          {orders.length === 0 && <p className="text-sm text-muted-foreground">Nothing to dispatch yet.</p>}
          {orders.map((order) => (
            <div key={order.pda_address} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted p-3">
              <div>
                <p className="text-sm font-medium">
                  {order.hub_name} → {order.pad_name}
                </p>
                <p className="text-xs text-muted-foreground">{formatSol(order.price_lamports)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{order.status}</Badge>
                {order.status === "Booked" && (
                  <Button size="sm" onClick={() => transition(order.pda_address, "assign")}>Assign drone</Button>
                )}
                {order.status === "Assigned" && (
                  <Button size="sm" onClick={() => transition(order.pda_address, "fly")}>Mark in flight</Button>
                )}
                {order.status === "InFlight" && (
                  <Button size="sm" onClick={() => transition(order.pda_address, "arrive")}>Mark arrived</Button>
                )}
                {order.status === "Locked" && (
                  <Button size="sm" variant="outline" onClick={() => transition(order.pda_address, "unlock")}>Force unlock</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
