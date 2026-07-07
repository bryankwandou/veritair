import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const SYSTEM_PROMPT = `You are the dispatch assistant for Veritair, a drone delivery service running on Solana Devnet.

Facts you answer from (do not invent others):
- Veritair delivers to places couriers can't reach: unpaved footpaths, closed roads, narrow alleys, mountain areas.
- The network: staffed Hubs launch drones; Landing Pads receive them. Housing pads sit inside gated communities; public pads serve open areas.
- Pricing is by weight, paid in Devnet SOL or Devnet USDC (both test assets, no real value):
  0-500g: 0.010 SOL | 501g-1kg: 0.015 | 1.01-3kg: 0.025 | 3.01-5kg: 0.040 | 5.01-10kg: 0.070. Housing pads add 0.002-0.006 SOL. Above 10kg isn't bookable.
- The recipient unlocks the parcel with a delivery code or the last 4 digits of their phone number. Five wrong attempts lock the order until a hub operator unlocks it.
- Every booking is a real signed Devnet transaction, checkable on Solscan from the /proof page.
- Booking happens at /book, tracking at /orders, hub registration at /operator.

Style: plain, direct sentences. No emoji, no exclamation marks, no marketing filler. If asked something outside these facts, say you don't have that information and point to the closest page. Keep answers under 120 words.`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ status: "error", message: "assistant not configured" }, { status: 503 });
  }

  const { messages } = await request.json();
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 20) {
    return NextResponse.json({ status: "error", message: "invalid messages" }, { status: 400 });
  }

  // Ground the assistant in the live network so "which hubs exist" gets a
  // real answer from the database, not a guess.
  let networkContext = "";
  try {
    const sql = db();
    const hubs = await sql.query(
      `SELECT h.name, h.active_drones, h.capacity,
              COALESCE(string_agg(p.name || ' (' || p.kind || ')', ', '), 'no pads yet') AS pads
       FROM hubs_mirror h LEFT JOIN pads_mirror p ON p.hub_pda = h.pda_address
       GROUP BY h.pda_address ORDER BY h.name`
    );
    networkContext =
      "\n\nCurrent live network:\n" +
      hubs.map((h) => `- ${h.name}: ${h.active_drones}/${h.capacity} drones, pads: ${h.pads}`).join("\n");
  } catch {
    // The assistant still works without live data; it just answers generally.
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 300,
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM_PROMPT + networkContext },
        ...messages.slice(-10).map((m: { role: string; content: string }) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: String(m.content).slice(0, 1000),
        })),
      ],
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ status: "error", message: "assistant unavailable" }, { status: 502 });
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content ?? "";
  return NextResponse.json({ reply });
}
