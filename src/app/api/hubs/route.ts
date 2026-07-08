import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// With 3,000+ pads in the network, embedding every pad in every hub response
// stopped being viable. `light=1` returns hubs only (for selectors); the
// full form aggregates pads but is capped and searchable.
export async function GET(request: NextRequest) {
  const sql = db();
  const params = request.nextUrl.searchParams;
  const q = (params.get("q") ?? "").trim();
  const light = params.get("light") === "1";
  const limit = Math.min(parseInt(params.get("limit") ?? (light ? "200" : "24"), 10) || 24, 300);

  const where = q ? `WHERE h.name ILIKE $2` : "";
  const args: unknown[] = q ? [limit, `%${q}%`] : [limit];

  if (light) {
    const hubs = await sql.query(
      `SELECT h.pda_address, h.name, h.lat, h.lng, h.capacity, h.active_drones
       FROM hubs_mirror h ${where}
       ORDER BY h.name ASC
       LIMIT $1`,
      args
    );
    return NextResponse.json({ hubs });
  }

  const hubs = await sql.query(
    `SELECT h.pda_address, h.authority_wallet, h.name, h.lat, h.lng, h.capacity, h.active_drones,
            COALESCE(json_agg(json_build_object(
              'pda_address', p.pda_address,
              'name', p.name,
              'lat', p.lat,
              'lng', p.lng,
              'kind', p.kind
            ) ORDER BY p.name) FILTER (WHERE p.pda_address IS NOT NULL), '[]') AS pads
     FROM hubs_mirror h
     LEFT JOIN pads_mirror p ON p.hub_pda = h.pda_address
     ${where}
     GROUP BY h.pda_address
     ORDER BY h.name ASC
     LIMIT $1`,
    args
  );
  return NextResponse.json({ hubs });
}
