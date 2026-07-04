# Veritair

**Drone delivery for the places roads don't reach — booked, paid, and confirmed on Solana Devnet, transaction by transaction.**

Live site: **[veritair.vercel.app](https://veritair.vercel.app)**
Repository: **[github.com/nayrbryanGaming/veritair](https://github.com/nayrbryanGaming/veritair)**

---

## Team

| Role | Name |
|---|---|
| Idea & concept owner | **Putra Purwanugraha Tengbunan** |
| PIC — Superteam Campus Club, Universitas Atma Jaya Makassar | **Vincentius Bryan Kwandou** |

Built for a Solana hackathon submission under the Superteam Campus Club, Universitas Atma Jaya Makassar.

---

## The problem

Some deliveries never make it onto a normal courier's route at all:

- **A village past the last paved road.** The rest of the way is a footpath, and a motorbike courier either refuses the job or charges an unpredictable premium for the last stretch.
- **A road closed by a protest or an accident.** Everything that depends on that road sits and waits — a drone was never using the road to begin with.
- **An alley too narrow for a bike, mismapped by consumer map software.** Couriers give up or circle the block for twenty minutes, every single time.

## The idea

Veritair is a two-sided drone delivery network:

- **Hubs** — staffed launch stations in busy districts, each with its own small drone fleet.
- **Landing pads** — the drop point nearest the recipient, either a **housing pad** inside a gated residential perimeter, or a **public pad** for open areas without one.
- **Delivery code** — set at booking, either a system-generated code or the last four digits of the recipient's phone number. The recipient enters it at the pad to release the parcel.
- **Weight-based pricing** — price scales with parcel weight, quoted in Devnet SOL and computed the same way on the client and on the server.

The distinguishing bet: this isn't a delivery app with a wallet-connect button glued on. Every booking is a real, signed Solana Devnet transaction, and every one is checkable on Solscan from the site's own `/proof` page.

## What's actually live right now

- A fully deployed site on Vercel — landing page, network directory, booking flow, order tracking, and a proof page.
- A real Neon Postgres database backing hub, pad, drone, and order data.
- Real Devnet transactions: booking a delivery signs and sends an actual Solana transaction (a System Program transfer for the payment, with the order event written into the transaction's memo log), confirmed on-chain before the order is recorded.
- Every order transaction is linked from `/orders` and `/proof` straight to Solscan (Devnet cluster) — nothing is simulated client-side only.

### A disclosed trade-off, not a hidden one

The original plan called for a custom on-chain Anchor program enforcing escrow and delivery-code verification directly in program logic. The native Rust/MSVC toolchain on the machine this was built on doesn't have a working linker (root-caused during the build: Visual Studio Build Tools fails to fully install in this environment), so the on-chain program couldn't be compiled here. The Rust source for that program still lives in `veritair_network/` for whenever a working build environment is available — see that folder for the full instruction set (hub/pad/drone registration, order creation, delivery confirmation, cancellation, and an expiry safety valve).

In the meantime, the same lifecycle is real and checkable through signed Devnet transactions; the rule enforcement (pricing, weight limits, code hashing) lives in the API layer instead of a program. This is stated plainly on the site's own `/proof` page, not glossed over.

## Tech stack

- **Frontend** — Next.js (App Router), Tailwind CSS v4, shadcn/ui, Framer Motion
- **Wallet** — `@solana/wallet-adapter-react` (Phantom, Solflare), pointed at Solana Devnet
- **Chain** — `@solana/web3.js`, System Program transfers + Memo program logging
- **Database** — Neon Postgres (serverless driver), mirroring on-chain-style state for fast reads
- **Deployment** — Vercel

## Running it locally

```bash
npm install
npm run dev
```

Environment variables (see `.env.local`, not committed):

```
DATABASE_URL=...            # Neon Postgres connection string
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PLATFORM_VAULT=...  # devnet wallet receiving booking payments
DB_INIT_KEY=...              # bootstraps the schema via /api/db/init
GROQ_API_KEY=...             # reserved for an upcoming dispatch assistant feature
```

## Project structure

```
src/app/            Next.js App Router pages and API routes
src/components/      UI components (landing page sections, shadcn primitives)
src/lib/solana/      Pricing table, Devnet constants, transaction builders
src/lib/db.ts        Neon Postgres client + schema
veritair_network/    Anchor/Rust program source (not yet deployable — see above)
```
