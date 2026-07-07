import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;
  const sql = db();
  const rows = await sql.query(
    `SELECT o.*, p.name AS pad_name, p.kind AS pad_kind, p.lat AS pad_lat, p.lng AS pad_lng,
            h.name AS hub_name, h.authority_wallet AS hub_authority, h.lat AS hub_lat, h.lng AS hub_lng
     FROM orders_mirror o
     JOIN pads_mirror p ON p.pda_address = o.pad_pda
     JOIN hubs_mirror h ON h.pda_address = p.hub_pda
     WHERE o.pda_address = $1
     LIMIT 1`,
    [address]
  );

  if (rows.length === 0) {
    return NextResponse.json({ status: "error", message: "order not found" }, { status: 404 });
  }

  return NextResponse.json({ order: rows[0] });
}
