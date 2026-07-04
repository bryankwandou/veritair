import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Request-triggered mirror sync (Part 9.2 of the project spec): the frontend
 * decodes an on-chain account right after a transaction confirms and posts
 * the decoded fields here. The chain stays the source of truth; this only
 * keeps a fast read cache for lists, maps, and history.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { kind, txSignature } = body;
  const sql = db();

  switch (kind) {
    case "hub": {
      const { pdaAddress, authorityWallet, name, lat, lng, capacity, activeDrones } = body;
      await sql.query(
        `INSERT INTO hubs_mirror (pda_address, authority_wallet, name, lat, lng, capacity, active_drones, last_tx_signature, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8, now())
         ON CONFLICT (pda_address) DO UPDATE SET
           active_drones = EXCLUDED.active_drones, last_tx_signature = EXCLUDED.last_tx_signature, updated_at = now()`,
        [pdaAddress, authorityWallet, name, lat, lng, capacity, activeDrones, txSignature]
      );
      break;
    }
    case "pad": {
      const { pdaAddress, hubPda, name, lat, lng, padKind } = body;
      await sql.query(
        `INSERT INTO pads_mirror (pda_address, hub_pda, name, lat, lng, kind, last_tx_signature, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7, now())
         ON CONFLICT (pda_address) DO UPDATE SET last_tx_signature = EXCLUDED.last_tx_signature, updated_at = now()`,
        [pdaAddress, hubPda, name, lat, lng, padKind, txSignature]
      );
      break;
    }
    case "drone": {
      const { pdaAddress, hubPda, status } = body;
      await sql.query(
        `INSERT INTO drones_mirror (pda_address, hub_pda, status, last_tx_signature, updated_at)
         VALUES ($1,$2,$3,$4, now())
         ON CONFLICT (pda_address) DO UPDATE SET status = EXCLUDED.status, last_tx_signature = EXCLUDED.last_tx_signature, updated_at = now()`,
        [pdaAddress, hubPda, status, txSignature]
      );
      break;
    }
    case "order": {
      const {
        pdaAddress,
        senderWallet,
        padPda,
        weightGrams,
        priceLamports,
        status,
        attemptCount,
        recipientPhoneHash,
      } = body;
      await sql.query(
        `INSERT INTO orders_mirror (pda_address, sender_wallet, pad_pda, weight_grams, price_lamports, status, attempt_count, recipient_phone_hash, last_tx_signature, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now())
         ON CONFLICT (pda_address) DO UPDATE SET
           status = EXCLUDED.status, attempt_count = EXCLUDED.attempt_count,
           last_tx_signature = EXCLUDED.last_tx_signature, updated_at = now()`,
        [pdaAddress, senderWallet, padPda, weightGrams, priceLamports, status, attemptCount, recipientPhoneHash ?? null, txSignature]
      );
      await sql.query(
        `INSERT INTO audit_log (event_type, order_pda, tx_signature, actor_wallet) VALUES ($1,$2,$3,$4)`,
        [`order_${status.toLowerCase()}`, pdaAddress, txSignature, senderWallet]
      );
      break;
    }
    default:
      return NextResponse.json({ status: "error", message: "unknown kind" }, { status: 400 });
  }

  return NextResponse.json({ status: "ok" });
}
