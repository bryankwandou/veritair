import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { hubPda } = await request.json();
  if (!hubPda) {
    return NextResponse.json({ status: "error", message: "hubPda required" }, { status: 400 });
  }

  const pdaAddress = `drone_${randomBytes(6).toString("hex")}`;
  const sql = db();
  await sql.query(
    `INSERT INTO drones_mirror (pda_address, hub_pda, status, updated_at) VALUES ($1,$2,'idle', now())`,
    [pdaAddress, hubPda]
  );
  await sql.query(
    `UPDATE hubs_mirror SET active_drones = active_drones + 1, updated_at = now() WHERE pda_address = $1`,
    [hubPda]
  );

  return NextResponse.json({ pdaAddress });
}
