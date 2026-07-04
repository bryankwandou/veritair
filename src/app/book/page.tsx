"use client";

import { useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reveal } from "@/components/reveal";
import { priceForWeight, formatSol } from "@/lib/solana/pricing";
import { buildOrderPaymentTransaction } from "@/lib/solana/memo-order";
import { solscanTxUrl } from "@/lib/solana/constants";

interface Pad {
  pda_address: string;
  name: string;
  kind: "public" | "housing";
}
interface Hub {
  pda_address: string;
  name: string;
  pads: Pad[];
}

export default function BookPage() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { setVisible } = useWalletModal();

  const [hubs, setHubs] = useState<Hub[]>([]);
  const [hubId, setHubId] = useState<string>("");
  const [padId, setPadId] = useState<string>("");
  const [grams, setGrams] = useState(1200);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [result, setResult] = useState<{ signature: string; code: string; orderPda: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/hubs")
      .then((r) => r.json())
      .then((data) => {
        const list: Hub[] = data.hubs ?? [];
        setHubs(list);
        if (list.length > 0) {
          setHubId(list[0].pda_address);
          if (list[0].pads.length > 0) setPadId(list[0].pads[0].pda_address);
        }
      });
  }, []);

  const currentHub = hubs.find((h) => h.pda_address === hubId);
  const currentPad = currentHub?.pads.find((p) => p.pda_address === padId);
  const price = useMemo(
    () => (currentPad ? priceForWeight(grams, currentPad.kind) : null),
    [grams, currentPad]
  );

  async function handleBook() {
    if (!publicKey) {
      setVisible(true);
      return;
    }
    if (!currentPad || price === null) return;

    setStatus("sending");
    setErrorMsg("");
    try {
      const tx = await buildOrderPaymentTransaction({
        connection,
        payer: publicKey,
        lamports: price,
        memoPayload: {
          event: "order_created",
          orderId: padId,
          weightGrams: grams,
          priceLamports: price,
        },
      });

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, "confirmed");

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderWallet: publicKey.toBase58(),
          padPda: padId,
          weightGrams: grams,
          padKind: currentPad.kind,
          txSignature: signature,
        }),
      });
      const data = await res.json();

      setResult({ signature, code: data.deliveryCode, orderPda: data.orderPda });
      setStatus("done");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong sending the transaction.");
      setStatus("error");
    }
  }

  if (status === "done" && result) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <Reveal>
          <div className="rounded-2xl border border-border bg-card p-8">
            <h1 className="text-2xl font-semibold tracking-tight">Order booked</h1>
            <p className="mt-2 text-muted-foreground">
              Give this code to the recipient — they&apos;ll need it to unlock the parcel at the pad.
            </p>
            <p className="mt-6 rounded-xl bg-muted p-4 font-mono text-2xl tracking-widest">
              {result.code}
            </p>
            <a
              href={solscanTxUrl(result.signature)}
              target="_blank"
              rel="noreferrer"
              className="mt-6 block text-sm text-primary underline underline-offset-4"
            >
              View the transaction on Solscan
            </a>
            <Button className="mt-6" variant="outline" onClick={() => setStatus("idle")}>
              Book another delivery
            </Button>
          </div>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <Reveal>
        <h1 className="text-3xl font-semibold tracking-tight">Book a delivery</h1>
        <p className="mt-2 text-muted-foreground">
          Pick a hub and a pad, set the weight, and sign one transaction to send it.
        </p>
      </Reveal>

      <Reveal delay={0.05} className="mt-8 space-y-6 rounded-2xl border border-border bg-card p-6">
        <div>
          <label className="mb-2 block text-sm font-medium">Hub</label>
          <div className="flex flex-wrap gap-2">
            {hubs.map((h) => (
              <button
                key={h.pda_address}
                onClick={() => {
                  setHubId(h.pda_address);
                  setPadId(h.pads[0]?.pda_address ?? "");
                }}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  hubId === h.pda_address
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-accent"
                }`}
              >
                {h.name}
              </button>
            ))}
            {hubs.length === 0 && (
              <p className="text-sm text-muted-foreground">No hubs yet — register one from the operator console.</p>
            )}
          </div>
        </div>

        {currentHub && (
          <div>
            <label className="mb-2 block text-sm font-medium">Landing pad</label>
            <div className="flex flex-wrap gap-2">
              {currentHub.pads.map((p) => (
                <button
                  key={p.pda_address}
                  onClick={() => setPadId(p.pda_address)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    padId === p.pda_address
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <label className="text-sm font-medium">Weight</label>
            <span className="font-mono text-sm tabular-nums text-muted-foreground">
              {grams.toLocaleString()} g
            </span>
          </div>
          <Slider value={[grams]} onValueChange={(v) => setGrams(Array.isArray(v) ? v[0] : v)} min={100} max={10000} step={50} />
        </div>

        <div className="flex items-center justify-between rounded-xl bg-muted p-4">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-mono text-lg font-semibold tabular-nums">
            {price !== null ? formatSol(price) : "Out of range"}
          </span>
        </div>

        {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}

        <Button
          className="w-full"
          size="lg"
          disabled={!currentPad || price === null || status === "sending"}
          onClick={handleBook}
        >
          {status === "sending"
            ? "Waiting for signature…"
            : publicKey
              ? "Pay & book"
              : "Connect wallet to book"}
        </Button>
      </Reveal>
    </div>
  );
}
