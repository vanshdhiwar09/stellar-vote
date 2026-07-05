#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, Address, Env, Map, String, Symbol, Vec,
};

// ==========================================
// 1. ERROR TYPES
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
    PollCounter,
    Poll(u32),
    Voter(u32, Address),
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PollData {
    pub id: u32,
    pub title: String,
    pub creator: Address,
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
    /// Creates a brand new poll on the network and assigns it a unique ID
    pub fn create_poll(
        env: Env,
        creator: Address,
        title: String,
        poll_options: Vec<String>,
    ) -> Result<u32, Error> {
        creator.require_auth();

        let poll_id: u32 = env.storage().instance().get(&DataKey::PollCounter).unwrap_or(0);

        let mut votes = Map::new(&env);
        for i in 0..poll_options.len() {
            votes.set(i, 0);
        }

        let poll = PollData {
            id: poll_id,
            title: title.clone(),
            creator: creator.clone(),
            is_active: true,
            options: poll_options,
            votes,
        };

        // Save poll and increment counter
        env.storage().instance().set(&DataKey::Poll(poll_id), &poll);
        env.storage().instance().set(&DataKey::PollCounter, &(poll_id + 1));

        // Emit an event for frontend syncing with the new poll_id
        env.events()
            .publish((Symbol::new(&env, "poll_created"), poll_id), title);

        Ok(poll_id)
    }

    /// Casts a vote for a specific option on a specific poll
    pub fn vote(env: Env, voter: Address, poll_id: u32, option_idx: u32) -> Result<(), Error> {
        // Enforce cryptographic signature from the voter
        voter.require_auth();

        let mut poll: PollData = env
            .storage()
            .instance()
            .get(&DataKey::Poll(poll_id))
            .ok_or(Error::NotInitialized)?;

        if !poll.is_active {
            return Err(Error::PollClosed);
        }

        let voter_key = DataKey::Voter(poll_id, voter.clone());
        if env.storage().persistent().has(&voter_key) {
            return Err(Error::AlreadyVoted);
        }

        if !poll.votes.contains_key(option_idx) {
            return Err(Error::InvalidOption);
        }

        // Increment vote count
        let current_votes = poll.votes.get(option_idx).unwrap();
        poll.votes.set(option_idx, current_votes + 1);

        // Record the voter to prevent double-voting on this specific poll
        env.storage().persistent().set(&voter_key, &true);
        
        // Save the updated poll state
        env.storage().instance().set(&DataKey::Poll(poll_id), &poll);

        // Emit an event containing the poll_id and option_idx
        env.events()
            .publish((Symbol::new(&env, "vote_cast"), poll_id, option_idx), voter);

        Ok(())
    }

    /// Fetches a specific poll by ID
    pub fn get_poll(env: Env, poll_id: u32) -> Result<PollData, Error> {
        env.storage()
            .instance()
            .get(&DataKey::Poll(poll_id))
            .ok_or(Error::NotInitialized)
    }

    /// Fetches all active polls mapped in storage (Note: scales poorly unbound, but good for demo sizing)
    pub fn get_polls(env: Env) -> Vec<PollData> {
        let count: u32 = env.storage().instance().get(&DataKey::PollCounter).unwrap_or(0);
        let mut polls = Vec::new(&env);
        for i in 0..count {
            if let Some(poll) = env.storage().instance().get(&DataKey::Poll(i)) {
                polls.push_back(poll);
            }
        }
        polls
    }
}

// Load test module
mod test;