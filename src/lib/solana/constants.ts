export const SOLANA_NETWORK = (process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet") as
  | "devnet"
  | "mainnet-beta";

export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

// Populated once the veritair_network program is deployed to Devnet (see /proof).
export const PROGRAM_ID = process.env.NEXT_PUBLIC_VERITAIR_PROGRAM_ID ?? "";

export function solscanTxUrl(signature: string): string {
  return `https://solscan.io/tx/${signature}?cluster=${SOLANA_NETWORK}`;
}

export function solscanAddressUrl(address: string): string {
  return `https://solscan.io/account/${address}?cluster=${SOLANA_NETWORK}`;
}

export const ORDER_STATUSES = [
  "Booked",
  "Assigned",
  "InFlight",
  "Arrived",
  "Delivered",
  "Cancelled",
  "Expired",
  "Locked",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
