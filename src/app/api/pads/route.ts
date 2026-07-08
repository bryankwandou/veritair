import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const hub = request.nextUrl.searchParams.get("hub");
  if (!hub) {
    return NextResponse.json({ status: "error", message: "hub query param required" }, { status: 400 });
  }
  const sql = db();
  const pads = await sql.query(
    `SELECT pda_address, name, lat, lng, kind
     FROM pads_mirror WHERE hub_pda = $1
     ORDER BY name ASC`,
    [hub]
  );
  return NextResponse.json({ pads });
}
