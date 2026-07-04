import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";

const NEXT_STATUS: Record<string, string> = {
  assign: "Assigned",
  fly: "InFlight",
  arrive: "Arrived",
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;
  const { action, code } = await request.json();
  const sql = db();

  if (action in NEXT_STATUS) {
    await sql.query(
      `UPDATE orders_mirror SET status = $1, updated_at = now() WHERE pda_address = $2`,
      [NEXT_STATUS[action], address]
    );
    await sql.query(
      `INSERT INTO audit_log (event_type, order_pda, actor_wallet) VALUES ($1,$2,'operator')`,
      [`order_${NEXT_STATUS[action].toLowerCase()}`, address]
    );
    return NextResponse.json({ status: "ok", newStatus: NEXT_STATUS[action] });
  }

  if (action === "confirm") {
    const rows = await sql.query(
      `SELECT recipient_phone_hash, attempt_count FROM orders_mirror WHERE pda_address = $1`,
      [address]
    );
    if (rows.length === 0) {
      return NextResponse.json({ status: "error", message: "order not found" }, { status: 404 });
    }
    const submittedHash = createHash("sha256").update(String(code)).digest("hex");
    const match = submittedHash === rows[0].recipient_phone_hash;

    if (match) {
      await sql.query(
        `UPDATE orders_mirror SET status = 'Delivered', updated_at = now() WHERE pda_address = $1`,
        [address]
      );
      await sql.query(
        `INSERT INTO audit_log (event_type, order_pda, actor_wallet) VALUES ('order_delivered',$1,'recipient')`,
        [address]
      );
      return NextResponse.json({ status: "ok", newStatus: "Delivered" });
    }

    const attempts = (rows[0].attempt_count ?? 0) + 1;
    const locked = attempts >= 5;
    await sql.query(
      `UPDATE orders_mirror SET attempt_count = $1, status = $2, updated_at = now() WHERE pda_address = $3`,
      [attempts, locked ? "Locked" : "Arrived", address]
    );
    return NextResponse.json(
      { status: "error", message: locked ? "Too many attempts — locked" : "Code doesn't match", attempts },
      { status: 400 }
    );
  }

  if (action === "unlock") {
    await sql.query(
      `UPDATE orders_mirror SET status = 'Arrived', attempt_count = 0, updated_at = now() WHERE pda_address = $1`,
      [address]
    );
    return NextResponse.json({ status: "ok", newStatus: "Arrived" });
  }

  return NextResponse.json({ status: "error", message: "unknown action" }, { status: 400 });
}
