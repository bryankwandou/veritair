import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Compact form of the whole network for the map layer: arrays, not objects,
// so 3,000+ points travel as a small payload. [lat, lng, kindFlag] per pad,
// [lat, lng, name] per hub.
export async function GET() {
  const sql = db();
  const [pads, hubs] = await Promise.all([
    sql.query(`SELECT lat, lng, kind FROM pads_mirror`),
    sql.query(`SELECT lat, lng, name FROM hubs_mirror`),
  ]);
  return NextResponse.json({
    pads: pads.map((p) => [Number(p.lat), Number(p.lng), p.kind === "housing" ? 1 : 0]),
    hubs: hubs.map((h) => [Number(h.lat), Number(h.lng), h.name]),
  });
}
