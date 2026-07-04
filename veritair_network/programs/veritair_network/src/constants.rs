use anchor_lang::prelude::*;

pub const PLATFORM_SEED: &[u8] = b"platform";
pub const HUB_SEED: &[u8] = b"hub";
pub const PAD_SEED: &[u8] = b"pad";
pub const DRONE_SEED: &[u8] = b"drone";
pub const COUNTER_SEED: &[u8] = b"counter";
pub const ORDER_SEED: &[u8] = b"order";
pub const VAULT_SEED: &[u8] = b"vault";

pub const MAX_NAME_LEN: usize = 64;
pub const MAX_ATTEMPTS: u8 = 5;
pub const EXPIRY_SECONDS: i64 = 24 * 60 * 60;
pub const MAX_BOOKABLE_GRAMS: u32 = 10_000;

const LAMPORTS_PER_SOL: u64 = 1_000_000_000;

/// Mirrors PART 6 of the project spec. Prices live in the program, never
/// supplied by the client, so a modified frontend can't talk its way into a
/// cheaper delivery or a richer payout.
pub fn price_for_weight(weight_grams: u32, is_housing: bool) -> Option<u64> {
    let (base_sol_thousandths, housing_sol_thousandths): (u64, u64) = match weight_grams {
        0..=500 => (10, 2),
        501..=1_000 => (15, 2),
        1_001..=3_000 => (25, 3),
        3_001..=5_000 => (40, 4),
        5_001..=10_000 => (70, 6),
        _ => return None,
    };
    let base = base_sol_thousandths * LAMPORTS_PER_SOL / 1_000;
    let surcharge = if is_housing {
        housing_sol_thousandths * LAMPORTS_PER_SOL / 1_000
    } else {
        0
    };
    Some(base + surcharge)
}

pub fn hash_code(code: &str) -> [u8; 32] {
    anchor_lang::solana_program::hash::hash(code.as_bytes()).to_bytes()
}
