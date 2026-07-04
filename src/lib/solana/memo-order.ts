import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

// This is the fallback wired up when the native Anchor/Rust toolchain
// couldn't build on this machine (see PROOF.md). Every order lifecycle
// event is still a real, signed Devnet transaction — payment moves via a
// System Program transfer and the event itself is written into the
// transaction log via the Memo program, so it stays 100% checkable on
// Solscan. The rule enforcement (weight limits, code hashing, status
// transitions) lives in the API layer instead of on-chain program logic.
const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

export const PLATFORM_VAULT = process.env.NEXT_PUBLIC_PLATFORM_VAULT ?? "";

function memoInstruction(memo: string): TransactionInstruction {
  return new TransactionInstruction({
    keys: [],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memo, "utf-8"),
  });
}

export interface OrderMemoPayload {
  event: "order_created" | "order_delivered" | "order_cancelled";
  orderId: string;
  weightGrams: number;
  priceLamports: number;
}

export function buildOrderPaymentTransaction(params: {
  connection: Connection;
  payer: PublicKey;
  lamports: number;
  memoPayload: OrderMemoPayload;
}): Promise<Transaction> {
  const { connection, payer, lamports, memoPayload } = params;
  const tx = new Transaction();
  tx.add(
    SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: new PublicKey(PLATFORM_VAULT),
      lamports,
    })
  );
  tx.add(memoInstruction(JSON.stringify(memoPayload)));
  return connection
    .getLatestBlockhash()
    .then(({ blockhash, lastValidBlockHeight }) => {
      tx.recentBlockhash = blockhash;
      tx.feePayer = payer;
      (tx as Transaction & { lastValidBlockHeight?: number }).lastValidBlockHeight =
        lastValidBlockHeight;
      return tx;
    });
}

export function buildMemoOnlyTransaction(params: {
  connection: Connection;
  payer: PublicKey;
  memoPayload: Record<string, unknown>;
}): Promise<Transaction> {
  const { connection, payer, memoPayload } = params;
  const tx = new Transaction();
  tx.add(memoInstruction(JSON.stringify(memoPayload)));
  return connection
    .getLatestBlockhash()
    .then(({ blockhash }) => {
      tx.recentBlockhash = blockhash;
      tx.feePayer = payer;
      return tx;
    });
}
