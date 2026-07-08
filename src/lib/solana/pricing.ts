export type PadKind = "public" | "housing";

export interface WeightTier {
  label: string;
  maxGrams: number | null;
  basePriceLamports: number;
  housingSurchargeLamports: number;
}

const LAMPORTS_PER_SOL = 1_000_000_000;
const sol = (amount: number) => Math.round(amount * LAMPORTS_PER_SOL);

// Mirrors the on-chain program's price table (Part 6 of the project spec) —
// the client only ever previews this; the program computes the real charge.
export const WEIGHT_TIERS: WeightTier[] = [
  { label: "0–500 g", maxGrams: 500, basePriceLamports: sol(0.01), housingSurchargeLamports: sol(0.002) },
  { label: "501 g–1 kg", maxGrams: 1_000, basePriceLamports: sol(0.015), housingSurchargeLamports: sol(0.002) },
  { label: "1.01–3 kg", maxGrams: 3_000, basePriceLamports: sol(0.025), housingSurchargeLamports: sol(0.003) },
  { label: "3.01–5 kg", maxGrams: 5_000, basePriceLamports: sol(0.04), housingSurchargeLamports: sol(0.004) },
  { label: "5.01–10 kg", maxGrams: 10_000, basePriceLamports: sol(0.07), housingSurchargeLamports: sol(0.006) },
];

export const MAX_BOOKABLE_GRAMS = 10_000;

// Service plans, like a real expedition's rate card. The multiplier applies
// to the weight-tier price; the SLA describes dispatch priority at the hub,
// not flight speed — a drone flies the same route either way.
export type ServiceTier = "regular" | "sameday" | "express" | "vip";

export interface ServicePlan {
  id: ServiceTier;
  name: string;
  multiplier: number;
  sla: string;
  detail: string;
}

export const SERVICE_PLANS: ServicePlan[] = [
  {
    id: "regular",
    name: "Regular",
    multiplier: 1,
    sla: "Dispatched within 24 hours",
    detail: "Joins the hub's next scheduled batch. The cheapest way to reach anywhere on the network.",
  },
  {
    id: "sameday",
    name: "Same-day",
    multiplier: 1.35,
    sla: "Dispatched the same day",
    detail: "Guaranteed to leave the hub before the day's last flight window.",
  },
  {
    id: "express",
    name: "Express",
    multiplier: 1.75,
    sla: "Dispatched within 2 hours",
    detail: "Jumps the batch queue. The next available drone takes it.",
  },
  {
    id: "vip",
    name: "VIP",
    multiplier: 2.5,
    sla: "Immediate dispatch, dedicated drone",
    detail: "A drone is reserved on booking and flies this parcel alone — nothing shares the flight.",
  },
];

export function planById(id: string): ServicePlan {
  return SERVICE_PLANS.find((p) => p.id === id) ?? SERVICE_PLANS[0];
}

export function tierForWeight(grams: number): WeightTier | null {
  if (grams <= 0 || grams > MAX_BOOKABLE_GRAMS) return null;
  return WEIGHT_TIERS.find((t) => t.maxGrams !== null && grams <= t.maxGrams) ?? null;
}

export function priceForWeight(
  grams: number,
  kind: PadKind,
  service: ServiceTier = "regular"
): number | null {
  const tier = tierForWeight(grams);
  if (!tier) return null;
  const base =
    kind === "housing" ? tier.basePriceLamports + tier.housingSurchargeLamports : tier.basePriceLamports;
  return Math.round(base * planById(service).multiplier);
}

export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

export function formatSol(lamports: number): string {
  return `${lamportsToSol(lamports).toFixed(3)} SOL`;
}

// Illustrative only — Devnet has no real market price for SOL, so this is a
// fixed reference rate purely so a USDC quote has something to derive from.
// Labeled as such everywhere it's shown.
const REFERENCE_USD_PER_SOL = 150;

export function lamportsToUsdc(lamports: number): number {
  return lamportsToSol(lamports) * REFERENCE_USD_PER_SOL;
}

export function formatUsdc(lamports: number): string {
  return `${lamportsToUsdc(lamports).toFixed(2)} USDC`;
}
