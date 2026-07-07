import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const sql = db();
  const rows = await sql.query(
    `SELECT
       (SELECT count(*) FROM hubs_mirror) AS hubs,
       (SELECT count(*) FROM pads_mirror) AS pads,
       (SELECT count(*) FROM drones_mirror) AS drones,
       (SELECT count(*) FROM orders_mirror) AS orders,
       (SELECT count(*) FROM orders_mirror WHERE status = 'Delivered') AS delivered,
       (SELECT tx_signature FROM audit_log WHERE tx_signature IS NOT NULL ORDER BY created_at DESC LIMIT 1) AS latest_tx`
  );
  return NextResponse.json({ stats: rows[0] });
}
