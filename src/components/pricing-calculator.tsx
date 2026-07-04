"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { priceForWeight, formatSol } from "@/lib/solana/pricing";

export function PricingCalculator() {
  const [grams, setGrams] = useState(1200);
  const [kind, setKind] = useState<"public" | "housing">("public");

  const price = useMemo(() => priceForWeight(grams, kind), [grams, kind]);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="flex flex-col gap-8 md:flex-row md:items-center">
        <div className="flex-1 space-y-6">
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <label className="text-sm font-medium">Parcel weight</label>
              <span className="font-mono text-sm tabular-nums text-muted-foreground">
                {grams.toLocaleString()} g
              </span>
            </div>
            <Slider
              value={[grams]}
              onValueChange={(v) => setGrams(Array.isArray(v) ? v[0] : v)}
              min={100}
              max={10000}
              step={50}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Landing pad</label>
            <Tabs value={kind} onValueChange={(v) => setKind(v as "public" | "housing")}>
              <TabsList>
                <TabsTrigger value="public">Public pad</TabsTrigger>
                <TabsTrigger value="housing">Housing pad</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center rounded-xl bg-muted p-6 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Quoted price</p>
          <motion.p
            key={price ?? "none"}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="mt-2 font-mono text-3xl font-semibold tabular-nums"
          >
            {price !== null ? formatSol(price) : "Contact a hub"}
          </motion.p>
          <p className="mt-2 text-xs text-muted-foreground">
            Devnet SOL — a test asset, not real money
          </p>
        </div>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        Price is set by weight and pad type today. Route-aware pricing — accounting for the
        actual flight distance between a hub and a pad — is a planned next step, not something
        we&apos;d fake with invented numbers.
      </p>
    </div>
  );
}
