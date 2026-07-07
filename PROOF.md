# Proof — Veritair on Solana Devnet

This is the verification record referenced from the site's `/proof` page. Everything below is
real and independently checkable — none of it is simulated.

## What's proven

A full order lifecycle was run end to end against the live deployment at
[veritair.vercel.app](https://veritair.vercel.app), backed by a real Neon Postgres database and a
real Solana Devnet transaction:

1. **Payment + booking** — a Devnet wallet (`35z7X59rtyts557Up1RAwpyYN7x2cFqcDc7RjPuNxFzr`) paid
   0.028 SOL for a 1.2 kg parcel to a housing pad, in one signed transaction:
   - System Program transfer carrying the payment
   - Memo program instruction logging the order event (weight, price, destination)
   - **Signature:** `4zMz83DoGdkR9zr22jcfmQ5uckbJFNoXx2qo2R6TPixncXFrZyhHGg1g5i4ZkDwLWF1PUjKM4YU7vofBdZ3LbvyY`
   - **Verify:** https://solscan.io/tx/4zMz83DoGdkR9zr22jcfmQ5uckbJFNoXx2qo2R6TPixncXFrZyhHGg1g5i4ZkDwLWF1PUjKM4YU7vofBdZ3LbvyY?cluster=devnet
2. **Dispatch** — the order moved `Booked → Assigned → InFlight → Arrived` through the operator
   console's transition endpoints.
3. **Wrong-code rejection** — an incorrect delivery code was submitted first and correctly
   rejected, incrementing the attempt counter (proves the abuse-resistance path, not just the
   happy path).
4. **Delivery confirmation** — the correct code was submitted and the order moved to
   `Delivered`.

Query the live order yourself:

```
GET https://veritair.vercel.app/api/orders/order_b5c4768e3de6bd65
```

## Why this isn't the original on-chain-program plan

The project was designed around a custom Anchor program (`veritair_network`) that would enforce
escrow release and delivery-code verification directly in program logic — not just record it.
The Rust source for that program is committed in full at `veritair_network/`, including every
instruction (`register_hub`, `register_pad`, `register_drone`, `create_order`, `assign_drone`,
`mark_in_flight`, `mark_arrived`, `confirm_delivery`, `force_unlock`, `cancel_order`,
`expire_order`).

It could not be compiled on the machine this was built on: the native Windows Rust/MSVC
toolchain has no working C++ linker. Three separate attempts to fix it were made and
diagnosed in order:

1. **Spaces in the project path** — ruled out. Moving the project to a space-free path changed
   nothing.
2. **Git for Windows shadowing the real linker** — `link.exe` resolved to Git's own coreutils
   utility (a hard-link tool, not the MSVC linker), which explained garbled early error
   messages, but wasn't the root cause either.
3. **A genuinely broken Visual Studio Build Tools install** — confirmed via the installer's own
   logs: `Microsoft.VC.14.44.17.14.CRT.x86.Desktop.base` failed to install with a
   `System.OutOfMemoryException` during package extraction. Both `modify --add` and `repair`
   silently no-op because the installer's internal state considers the component already
   present. A full uninstall/reinstall was attempted; the same memory pressure (native RAM was
   under 2 GB free during the attempt) blocked it again.
4. A parallel path — installing the MinGW-w64 GNU toolchain and pointing the whole Rust host
   target at it — successfully compiled the program's own crate with a plain `cargo build`, but
   `cargo build-sbf` (the actual Solana on-chain build step) hard-requires the MSVC target for
   host-side build scripts on Windows regardless of the default toolchain, so this didn't unblock
   the final on-chain artifact either.

Given the fix required more memory headroom than was available in that session, the shipped
MVP uses the fallback described in the project's own build plan: the same order lifecycle, the
same weight-based pricing, the same delivery-code mechanic — enforced by the API layer and
recorded through real signed Devnet transactions, rather than by an on-chain program. The
`veritair_network` source is ready to deploy as soon as it's built in an environment with a
working MSVC toolchain (or on Linux/WSL2, where this class of problem doesn't occur).

## What's still simulated

- **Drone flight itself.** Nothing here claims to control physical hardware — "in flight" is a
  software state moved by a hub operator, exactly as scoped from the start.
- **Distance-based pricing.** Price is weight- and pad-type-based only; route-aware pricing
  would need real flight-routing data this project doesn't have.
