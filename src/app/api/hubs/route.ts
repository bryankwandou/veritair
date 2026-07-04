import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const sql = db();
  const hubs = await sql.query(
    `SELECT h.pda_address, h.authority_wallet, h.name, h.lat, h.lng, h.capacity, h.active_drones,
            COALESCE(json_agg(json_build_object(
              'pda_address', p.pda_address,
              'name', p.name,
              'lat', p.lat,
              'lng', p.lng,
              'kind', p.kind
            )) FILTER (WHERE p.pda_address IS NOT NULL), '[]') AS pads
     FROM hubs_mirror h
     LEFT JOIN pads_mirror p ON p.hub_pda = h.pda_address
     GROUP BY h.pda_address
     ORDER BY h.updated_at DESC`
  );
  return NextResponse.json({ hubs });
}
