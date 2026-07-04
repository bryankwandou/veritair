import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const sql = db();
  const orders = await sql.query(
    `SELECT o.pda_address, o.status, o.price_lamports, p.name AS pad_name, h.name AS hub_name, h.authority_wallet AS hub_authority
     FROM orders_mirror o
     JOIN pads_mirror p ON p.pda_address = o.pad_pda
     JOIN hubs_mirror h ON h.pda_address = p.hub_pda
     WHERE o.status NOT IN ('Delivered', 'Cancelled', 'Expired')
     ORDER BY o.created_at DESC`
  );
  return NextResponse.json({ orders });
}
