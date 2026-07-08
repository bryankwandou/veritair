import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { db } from "@/lib/db";
import { priceForWeight, SERVICE_PLANS, type ServiceTier } from "@/lib/solana/pricing";

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { senderWallet, padPda, weightGrams, padKind, deliveryCode, txSignature, serviceTier } = body;

  if (!senderWallet || !padPda || !weightGrams || !padKind || !txSignature) {
    return NextResponse.json({ status: "error", message: "missing required fields" }, { status: 400 });
  }

  const tier: ServiceTier = SERVICE_PLANS.some((p) => p.id === serviceTier) ? serviceTier : "regular";
  const price = priceForWeight(weightGrams, padKind === "housing" ? "housing" : "public", tier);
  if (price === null) {
    return NextResponse.json({ status: "error", message: "weight out of range" }, { status: 400 });
  }

  const code = deliveryCode || randomBytes(3).toString("hex").toUpperCase();
  const orderPda = `order_${randomBytes(8).toString("hex")}`;

  const sql = db();
  await sql.query(
    `INSERT INTO orders_mirror (pda_address, sender_wallet, pad_pda, weight_grams, price_lamports, status, attempt_count, recipient_phone_hash, last_tx_signature, service_tier, updated_at)
     VALUES ($1,$2,$3,$4,$5,'Booked',0,$6,$7,$8, now())`,
    [orderPda, senderWallet, padPda, weightGrams, price, hashCode(code), txSignature, tier]
  );
  await sql.query(
    `INSERT INTO audit_log (event_type, order_pda, tx_signature, actor_wallet) VALUES ('order_created',$1,$2,$3)`,
    [orderPda, txSignature, senderWallet]
  );

  return NextResponse.json({ orderPda, deliveryCode: code, priceLamports: price });
}

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet");
  if (!wallet) {
    return NextResponse.json({ status: "error", message: "wallet query param required" }, { status: 400 });
  }

  const sql = db();
  const orders = await sql.query(
    `SELECT o.*, p.name AS pad_name, p.kind AS pad_kind, h.name AS hub_name
     FROM orders_mirror o
     JOIN pads_mirror p ON p.pda_address = o.pad_pda
     JOIN hubs_mirror h ON h.pda_address = p.hub_pda
     WHERE o.sender_wallet = $1
     ORDER BY o.created_at DESC`,
    [wallet]
  );

  return NextResponse.json({ orders });
}
