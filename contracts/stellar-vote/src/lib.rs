#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, Address, Env, Map, String, Symbol, Vec,
};

// ==========================================
// 1. ERROR TYPES (Level 2 Requirement)
// ==========================================
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    PollClosed = 3,
    AlreadyVoted = 4,
    InvalidOption = 5,
}

// ==========================================
// 2. DATA STRUCTURES
// ==========================================
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Poll,
    Voter(Address),
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PollData {
    pub title: String,
    pub is_active: bool,
    pub options: Vec<String>,
    pub votes: Map<u32, u32>,
}

// ==========================================
// 3. CONTRACT LOGIC
// ==========================================
#[contract]
pub struct StellarVoteContract;

#[contractimpl]
impl StellarVoteContract {
    /// Initializes the poll with a title and a list of options.
    pub fn init(env: Env, title: String, poll_options: Vec<String>) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Poll) {
            return Err(Error::AlreadyInitialized);
        }

        let mut votes = Map::new(&env);
        for i in 0..poll_options.len() {
            votes.set(i, 0);
        }

        let poll = PollData {
            title: title.clone(),
            is_active: true,
            options: poll_options,
            votes,
        };

        // Save poll configuration
        env.storage().instance().set(&DataKey::Poll, &poll);

        // Emit an event for frontend syncing
        env.events()
            .publish((Symbol::new(&env, "poll_init"),), title);

        Ok(())
    }

    /// Casts a vote for a specific option.
    pub fn vote(env: Env, voter: Address, option_idx: u32) -> Result<(), Error> {
        // Enforce cryptographic signature from the voter
        voter.require_auth();

        let mut poll: PollData = env
            .storage()
            .instance()
            .get(&DataKey::Poll)
            .ok_or(Error::NotInitialized)?;

        if !poll.is_active {
            return Err(Error::PollClosed);
        }

        let voter_key = DataKey::Voter(voter.clone());
        if env.storage().persistent().has(&voter_key) {
            return Err(Error::AlreadyVoted);
        }

        if !poll.votes.contains_key(option_idx) {
            return Err(Error::InvalidOption);
        }

        // Increment vote count
        let current_votes = poll.votes.get(option_idx).unwrap();
        poll.votes.set(option_idx, current_votes + 1);

        // Record the voter to prevent double-voting
        env.storage().persistent().set(&voter_key, &true);
        // Save the updated poll state
        env.storage().instance().set(&DataKey::Poll, &poll);

        // Emit an event containing the option_idx and voter address
        env.events()
            .publish((Symbol::new(&env, "vote_cast"), option_idx), voter);

        Ok(())
    }

    /// Fetches the current state of the poll.
    pub fn get_poll(env: Env) -> Result<PollData, Error> {
        env.storage()
            .instance()
            .get(&DataKey::Poll)
            .ok_or(Error::NotInitialized)
    }
}

// Load test module
mod test;