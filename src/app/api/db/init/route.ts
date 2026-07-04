import { NextRequest, NextResponse } from "next/server";
import { db, SCHEMA_STATEMENTS } from "@/lib/db";

export async function GET(request: NextRequest) {
  const key = request.headers.get("x-db-init-key");
  const expected = process.env.DB_INIT_KEY;

  if (!expected || key !== expected) {
    return NextResponse.json({ status: "error", message: "unauthorized" }, { status: 401 });
  }

  const sql = db();
  for (const statement of SCHEMA_STATEMENTS) {
    await sql.query(statement);
  }

  return NextResponse.json({ status: "ok", tables: SCHEMA_STATEMENTS.length });
}
