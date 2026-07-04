import { neon } from "@neondatabase/serverless";

export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return neon(url);
}

export const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS hubs_mirror (
    pda_address TEXT PRIMARY KEY,
    authority_wallet TEXT NOT NULL,
    name TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    capacity INTEGER NOT NULL,
    active_drones INTEGER NOT NULL DEFAULT 0,
    last_tx_signature TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS pads_mirror (
    pda_address TEXT PRIMARY KEY,
    hub_pda TEXT NOT NULL REFERENCES hubs_mirror(pda_address),
    name TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('public', 'housing')),
    last_tx_signature TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS drones_mirror (
    pda_address TEXT PRIMARY KEY,
    hub_pda TEXT NOT NULL REFERENCES hubs_mirror(pda_address),
    status TEXT NOT NULL CHECK (status IN ('idle', 'assigned', 'in_flight')),
    last_tx_signature TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS orders_mirror (
    pda_address TEXT PRIMARY KEY,
    sender_wallet TEXT NOT NULL,
    pad_pda TEXT NOT NULL REFERENCES pads_mirror(pda_address),
    weight_grams INTEGER NOT NULL,
    price_lamports BIGINT NOT NULL,
    status TEXT NOT NULL,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    recipient_phone_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_tx_signature TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    order_pda TEXT,
    tx_signature TEXT,
    actor_wallet TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_orders_sender ON orders_mirror(sender_wallet)`,
  `CREATE INDEX IF NOT EXISTS idx_pads_hub ON pads_mirror(hub_pda)`,
  `CREATE INDEX IF NOT EXISTS idx_drones_hub ON drones_mirror(hub_pda)`,
];
