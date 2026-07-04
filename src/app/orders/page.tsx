"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/reveal";
import { formatSol } from "@/lib/solana/pricing";
import { solscanTxUrl } from "@/lib/solana/constants";

interface OrderRow {
  pda_address: string;
  hub_name: string;
  pad_name: string;
  weight_grams: number;
  price_lamports: number;
  status: string;
  last_tx_signature: string;
}

export default function OrdersPage() {
  const { publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) return;
    setLoading(true);
    fetch(`/api/orders?wallet=${publicKey.toBase58()}`)
      .then((r) => r.json())
      .then((data) => setOrders(data.orders ?? []))
      .finally(() => setLoading(false));
  }, [publicKey]);

  if (!publicKey) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <Reveal>
          <h1 className="text-2xl font-semibold tracking-tight">Your orders</h1>
          <p className="mt-2 text-muted-foreground">Connect a wallet to see what you&apos;ve booked.</p>
          <Button className="mt-6" onClick={() => setVisible(true)}>
            Connect wallet
          </Button>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Reveal>
        <h1 className="text-3xl font-semibold tracking-tight">Your orders</h1>
        <p className="mt-2 text-muted-foreground">Newest first, each linked to its own transaction.</p>
      </Reveal>

      <div className="mt-8 space-y-3">
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!loading && orders.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            No orders yet.
          </div>
        )}
        {orders.map((order, i) => (
          <Reveal key={order.pda_address} delay={i * 0.05}>
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div>
                <p className="font-medium">
                  {order.hub_name} → {order.pad_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.weight_grams.toLocaleString()} g · {formatSol(order.price_lamports)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{order.status}</Badge>
                {order.last_tx_signature && (
                  <a
                    href={solscanTxUrl(order.last_tx_signature)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary underline underline-offset-4"
                  >
                    Tx
                  </a>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
