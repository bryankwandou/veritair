import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";

// Guarded transitions: each action is only legal from one specific state,
// mirroring the on-chain program spec. Without these guards a caller could
// "arrive" a booked order or re-fly a delivered one.
const TRANSITIONS: Record<string, { from: string; to: string; actor: string }> = {
  assign: { from: "Booked", to: "Assigned", actor: "operator" },
  fly: { from: "Assigned", to: "InFlight", actor: "operator" },
  arrive: { from: "InFlight", to: "Arrived", actor: "operator" },
  unlock: { from: "Locked", to: "Arrived", actor: "operator" },
  cancel: { from: "Booked", to: "Cancelled", actor: "sender" },
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;
  const { action, code } = await request.json();
  const sql = db();

  const rows = await sql.query(
    `SELECT status, attempt_count, recipient_phone_hash, sender_wallet
     FROM orders_mirror WHERE pda_address = $1`,
    [address]
  );
  if (rows.length === 0) {
    return NextResponse.json({ status: "error", message: "order not found" }, { status: 404 });
  }
  const current = rows[0];

  if (action in TRANSITIONS) {
    const t = TRANSITIONS[action];
    if (current.status !== t.from) {
      return NextResponse.json(
        { status: "error", message: `${action} is only valid from ${t.from}, order is ${current.status}` },
        { status: 409 }
      );
    }
    const resetAttempts = action === "unlock" ? ", attempt_count = 0" : "";
    await sql.query(
      `UPDATE orders_mirror SET status = $1${resetAttempts}, updated_at = now() WHERE pda_address = $2`,
      [t.to, address]
    );
    await sql.query(
      `INSERT INTO audit_log (event_type, order_pda, actor_wallet) VALUES ($1,$2,$3)`,
      [`order_${t.to.toLowerCase()}`, address, t.actor === "sender" ? current.sender_wallet : "operator"]
    );
    return NextResponse.json({ status: "ok", newStatus: t.to });
  }

  if (action === "confirm") {
    // The code check only exists at the pad. A locked order stays locked no
    // matter what code is submitted — that's the point of the lockout.
    if (current.status !== "Arrived") {
      return NextResponse.json(
        {
          status: "error",
          message:
            current.status === "Locked"
              ? "Order is locked — a hub operator has to unlock it first"
              : `Delivery can only be confirmed once the drone has arrived (order is ${current.status})`,
        },
        { status: 409 }
      );
    }

    const submittedHash = createHash("sha256").update(String(code)).digest("hex");
    if (submittedHash === current.recipient_phone_hash) {
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

    const attempts = (current.attempt_count ?? 0) + 1;
    const locked = attempts >= 5;
    await sql.query(
      `UPDATE orders_mirror SET attempt_count = $1, status = $2, updated_at = now() WHERE pda_address = $3`,
      [attempts, locked ? "Locked" : "Arrived", address]
    );
    if (locked) {
      await sql.query(
        `INSERT INTO audit_log (event_type, order_pda, actor_wallet) VALUES ('order_locked',$1,'recipient')`,
        [address]
      );
    }
    return NextResponse.json(
      {
        status: "error",
        message: locked ? "Too many wrong attempts — order locked" : "Code doesn't match",
        attempts,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ status: "error", message: "unknown action" }, { status: 400 });
}
