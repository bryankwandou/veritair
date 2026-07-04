use anchor_lang::prelude::*;

#[account]
pub struct Platform {
    pub authority: Pubkey,
    pub bump: u8,
}
impl Platform {
    pub const SPACE: usize = 8 + 32 + 1;
}

#[account]
pub struct Hub {
    pub authority: Pubkey,
    pub name: String,
    pub lat: i32,
    pub lng: i32,
    pub capacity: u16,
    pub active_drones: u16,
    pub bump: u8,
}
impl Hub {
    pub const SPACE: usize = 8 + 32 + (4 + crate::MAX_NAME_LEN) + 4 + 4 + 2 + 2 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum PadKind {
    Public,
    Housing,
}

#[account]
pub struct LandingPad {
    pub hub: Pubkey,
    pub name: String,
    pub lat: i32,
    pub lng: i32,
    pub kind: PadKind,
    pub bump: u8,
}
impl LandingPad {
    pub const SPACE: usize = 8 + 32 + (4 + crate::MAX_NAME_LEN) + 4 + 4 + 1 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum DroneStatus {
    Idle,
    Assigned,
    InFlight,
}

#[account]
pub struct Drone {
    pub hub: Pubkey,
    pub status: DroneStatus,
    pub bump: u8,
}
impl Drone {
    pub const SPACE: usize = 8 + 32 + 1 + 1;
}

#[account]
pub struct SenderCounter {
    pub next_nonce: u64,
    pub bump: u8,
}
impl SenderCounter {
    pub const SPACE: usize = 8 + 8 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum OrderStatus {
    Booked,
    Assigned,
    InFlight,
    Arrived,
    Delivered,
    Cancelled,
    Expired,
    Locked,
}

#[account]
pub struct Order {
    pub sender: Pubkey,
    pub pad: Pubkey,
    pub weight_grams: u32,
    pub price_lamports: u64,
    pub code_hash: [u8; 32],
    pub status: OrderStatus,
    pub attempt_count: u8,
    pub created_at: i64,
    pub assigned_drone: Option<Pubkey>,
    pub nonce: u64,
    pub bump: u8,
    pub vault_bump: u8,
}
impl Order {
    pub const SPACE: usize =
        8 + 32 + 32 + 4 + 8 + 32 + 1 + 1 + 8 + (1 + 32) + 8 + 1 + 1;
}
