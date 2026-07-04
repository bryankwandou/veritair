import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PROGRAM_ID, SOLANA_NETWORK } from "@/lib/solana/constants";

export async function GET() {
  const sql = db();
  const recent = await sql.query(
    `SELECT event_type, order_pda, tx_signature, actor_wallet, created_at
     FROM audit_log
     WHERE tx_signature IS NOT NULL
     ORDER BY created_at DESC
     LIMIT 25`
  );

  return NextResponse.json({
    programId: PROGRAM_ID,
    cluster: SOLANA_NETWORK,
    recentTransactions: recent,
  });
}
