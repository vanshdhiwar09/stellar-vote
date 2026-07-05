#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String, Vec};

#[test]
fn test_poll_happy_path() {
    let env = Env::default();
    env.mock_all_auths(); // Automatically mock signature checks for tests

    // Register contract dynamically matching v22+ specifications
    let contract_id = env.register(StellarVoteContract, ());
    let client = StellarVoteContractClient::new(&env, &contract_id);

    // Prepare initialization data
    let creator = Address::generate(&env);
    let title = String::from_str(&env, "Best Web3 Ecosystem");
    let mut options = Vec::new(&env);
    options.push_back(String::from_str(&env, "Soroban"));
    options.push_back(String::from_str(&env, "Solana"));
    options.push_back(String::from_str(&env, "Ethereum"));

    // 1. Test Initialization (Creates poll 0)
    let poll_id = client.create_poll(&creator, &title, &options);
    assert_eq!(poll_id, 0);
    
    let poll = client.get_poll(&poll_id);
    assert_eq!(poll.title, title);
    assert_eq!(poll.creator, creator);
    assert_eq!(poll.votes.get(0).unwrap(), 0); // Soroban starts at 0 votes

    // 2. Test Voting
    let voter1 = Address::generate(&env);
    client.vote(&voter1, &poll_id, &0); // Vote for Soroban (index 0)

    let updated_poll = client.get_poll(&poll_id);
    assert_eq!(updated_poll.votes.get(0).unwrap(), 1); // Soroban now has 1 vote
}

#[test]
#[should_panic(expected = "Error(Contract, #4)")]
fn test_double_voting_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(StellarVoteContract, ());
    let client = StellarVoteContractClient::new(&env, &contract_id);

    let creator = Address::generate(&env);
    let title = String::from_str(&env, "Test Poll");
    let mut options = Vec::new(&env);
    options.push_back(String::from_str(&env, "Option A"));

    let poll_id = client.create_poll(&creator, &title, &options);

    let voter = Address::generate(&env);
    
    // First vote succeeds
    client.vote(&voter, &poll_id, &0);
    
    // Second vote should panic with Error::AlreadyVoted (Enum index 4)
    client.vote(&voter, &poll_id, &0);
}