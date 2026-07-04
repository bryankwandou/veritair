"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/reveal";
import { solscanTxUrl } from "@/lib/solana/constants";

interface Tx {
  event_type: string;
  tx_signature: string;
  actor_wallet: string;
  created_at: string;
}

export default function ProofPage() {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [cluster, setCluster] = useState("devnet");

  useEffect(() => {
    fetch("/api/proof")
      .then((r) => r.json())
      .then((data) => {
        setTxs(data.recentTransactions ?? []);
        setCluster(data.cluster ?? "devnet");
      });
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Reveal>
        <h1 className="text-3xl font-semibold tracking-tight">Verify everything</h1>
        <p className="mt-2 text-muted-foreground">
          This build ships without its own on-chain program — the native Rust toolchain on the
          machine it was built on couldn&apos;t compile one (documented in{" "}
          <code className="rounded bg-muted px-1 py-0.5">PROOF.md</code> in the repository).
          Every order lifecycle event is still a real signed transaction on Solana {cluster}: a
          System Program transfer carrying the payment, with the event itself written into the
          transaction&apos;s memo log. Nothing below is simulated.
        </p>
      </Reveal>

      <Reveal delay={0.05} className="mt-10">
        <h2 className="text-lg font-medium">Recent transactions</h2>
        <div className="mt-4 space-y-2">
          {txs.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No transactions recorded yet — book a delivery to produce the first one.
            </p>
          )}
          {txs.map((tx) => (
            <div
              key={tx.tx_signature}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4 text-sm"
            >
              <span className="font-mono text-muted-foreground">{tx.event_type}</span>
              <a
                href={solscanTxUrl(tx.tx_signature)}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline underline-offset-4"
              >
                {tx.tx_signature.slice(0, 12)}…
              </a>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
