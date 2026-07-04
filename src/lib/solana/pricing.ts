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

export function tierForWeight(grams: number): WeightTier | null {
  if (grams <= 0 || grams > MAX_BOOKABLE_GRAMS) return null;
  return WEIGHT_TIERS.find((t) => t.maxGrams !== null && grams <= t.maxGrams) ?? null;
}

export function priceForWeight(grams: number, kind: PadKind): number | null {
  const tier = tierForWeight(grams);
  if (!tier) return null;
  return kind === "housing" ? tier.basePriceLamports + tier.housingSurchargeLamports : tier.basePriceLamports;
}

export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

export function formatSol(lamports: number): string {
  return `${lamportsToSol(lamports).toFixed(3)} SOL`;
}
