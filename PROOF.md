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

## Full state-machine verification — 20/20 checks, run against production

A second, exhaustive verification pass was run later against the live deployment, covering
every legal transition, every guard that must reject an illegal one, and both terminal paths.
All twenty checks passed. The two bookings in this run are real Devnet transactions:

- **Order 1** (delivered after a lockout):
  `47FYvDduZNDxLmFd8ivGCsYaySkfj2Bm6xhnYBabuF9maSKVQU9WS7adH4fDroeJv3BkbNHdKcGj21rUxsT11ke`
- **Order 2** (cancelled from Booked):
  `5ZPCcM3vwvxNV4hxkv4jkBV35DXDt6BRgXkgkogALffdUA6KGMKKcoxpVCKo2urG3bVC22T2iWq2s6VLCCr44VM1`

Both checkable at `solscan.io/tx/<signature>?cluster=devnet`.

What the run proved, in order:

1. Operator registration works end to end: a new hub (`hub_5feeb9d42e86`), a pad under it,
   and a drone into its fleet, all through the public API.
2. Booking pays on Devnet and records the order (`order_84710d9c70260829`).
3. **Guards hold**: `fly` from `Booked`, `confirm` before arrival (even with the *correct*
   code), and `unlock` of a non-locked order are all rejected with 409s.
4. The legal sequence `assign → fly → arrive` moves the order through each state, and
   `cancel` is refused once a drone is assigned.
5. Five wrong delivery codes lock the order — and while locked, **even the correct code is
   rejected**. That last check matters: an earlier revision had a bug where a correct code
   bypassed the lockout, found by re-reading the transition handler and fixed before this run.
6. Operator `force_unlock` returns the order to `Arrived`; the correct code then delivers it;
   re-confirming a delivered order is rejected.
7. A second booking cancels cleanly from `Booked`; double-cancel and assigning a cancelled
   order are both rejected.

Bugs found and fixed during this hardening pass, for the record:

- The order page's progress bar rendered a `Locked` order as fully delivered (status index
  overflow). Locked now displays at the Arrived stage; Cancelled/Expired show a distinct
  closed state.
- Status transitions did no current-state validation at the API layer — any action was
  accepted from any state. All transitions are now guarded.
- The lockout could be bypassed by submitting the correct code while locked. Confirm now
  requires `Arrived` status outright.

## Nationwide network + service plans — 8/8 checks, run against production

A third verification pass after the network was scaled to national size and service plans
were added:

- **84 hubs and 3,244 landing pads** are live, generated deterministically (seeded PRNG)
  around 81 verified Indonesian city-center anchors, from Banda Aceh to Merauke.
- **No-sea guarantee, by construction and then verified**: every generated pad is within a
  small radius of its city anchor (0.006° ≈ 650 m for coastal cities, up to 0.03° ≈ 3.3 km
  inland). The verification pass measured every one of the 3,240 generated pads against its
  nearest anchor: maximum distance 3.34 km, zero outliers. The four original hand-placed
  demo pads sit at individually verified inland coordinates and are documented separately.
- **Service plans** (Regular ×1, Same-day ×1.35, Express ×1.75, VIP ×2.5) are priced
  server-side from the same table the client previews — a modified client cannot pick its
  own price. Verified live: a 1.2 kg housing-pad VIP booking was quoted 0.070 SOL by the
  server ((0.025 + 0.003) × 2.5), paid with a real Devnet transaction, recorded with
  `service_tier = vip`, and delivered end to end:
  `5re73eRXiasCaLukxu1YVjM7rAji9vUSqxdDNTsaoJF4CWxuwUrMv1wASFSriwBNnxbCUQuGMDUwPukCq2kn8rcq`

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
