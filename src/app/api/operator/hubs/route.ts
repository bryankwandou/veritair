import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { authorityWallet, name, lat, lng, capacity } = await request.json();
  if (!authorityWallet || !name || lat === undefined || lng === undefined || !capacity) {
    return NextResponse.json({ status: "error", message: "missing required fields" }, { status: 400 });
  }

  const pdaAddress = `hub_${randomBytes(6).toString("hex")}`;
  const sql = db();
  await sql.query(
    `INSERT INTO hubs_mirror (pda_address, authority_wallet, name, lat, lng, capacity, active_drones, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,0, now())`,
    [pdaAddress, authorityWallet, name, lat, lng, capacity]
  );

  return NextResponse.json({ pdaAddress });
}
