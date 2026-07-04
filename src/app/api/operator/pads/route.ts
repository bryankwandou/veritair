import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { hubPda, name, lat, lng, kind } = await request.json();
  if (!hubPda || !name || lat === undefined || lng === undefined || !kind) {
    return NextResponse.json({ status: "error", message: "missing required fields" }, { status: 400 });
  }

  const pdaAddress = `pad_${randomBytes(6).toString("hex")}`;
  const sql = db();
  await sql.query(
    `INSERT INTO pads_mirror (pda_address, hub_pda, name, lat, lng, kind, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6, now())`,
    [pdaAddress, hubPda, name, lat, lng, kind]
  );

  return NextResponse.json({ pdaAddress });
}
