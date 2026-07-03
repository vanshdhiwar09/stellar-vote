import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}




export const Errors = {
  1: {message:"AlreadyInitialized"},
  2: {message:"NotInitialized"},
  3: {message:"PollClosed"},
  4: {message:"AlreadyVoted"},
  5: {message:"InvalidOption"}
}

export type DataKey = {tag: "Poll", values: void} | {tag: "Voter", values: readonly [string]};


export interface PollData {
  is_active: boolean;
  options: Array<string>;
  title: string;
  votes: Map<u32, u32>;
}

export interface Client {
  /**
   * Construct and simulate a init transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initializes the poll with a title and a list of options.
   */
  init: ({title, options}: {title: string, options: Array<string>}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Casts a vote for a specific option.
   */
  vote: ({voter, option_idx}: {voter: string, option_idx: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_poll transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Fetches the current state of the poll.
   */
  get_poll: (options?: MethodOptions) => Promise<AssembledTransaction<Result<PollData>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAAAAADhJbml0aWFsaXplcyB0aGUgcG9sbCB3aXRoIGEgdGl0bGUgYW5kIGEgbGlzdCBvZiBvcHRpb25zLgAAAARpbml0AAAAAgAAAAAAAAAFdGl0bGUAAAAAAAAQAAAAAAAAAAdvcHRpb25zAAAAA+oAAAAQAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
        "AAAAAAAAACNDYXN0cyBhIHZvdGUgZm9yIGEgc3BlY2lmaWMgb3B0aW9uLgAAAAAEdm90ZQAAAAIAAAAAAAAABXZvdGVyAAAAAAAAEwAAAAAAAAAKb3B0aW9uX2lkeAAAAAAABAAAAAEAAAPpAAAD7QAAAAAAAAAD",
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAABQAAAAAAAAASQWxyZWFkeUluaXRpYWxpemVkAAAAAAABAAAAAAAAAA5Ob3RJbml0aWFsaXplZAAAAAAAAgAAAAAAAAAKUG9sbENsb3NlZAAAAAAAAwAAAAAAAAAMQWxyZWFkeVZvdGVkAAAABAAAAAAAAAANSW52YWxpZE9wdGlvbgAAAAAAAAU=",
        "AAAAAAAAACZGZXRjaGVzIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBwb2xsLgAAAAAACGdldF9wb2xsAAAAAAAAAAEAAAPpAAAH0AAAAAhQb2xsRGF0YQAAAAM=",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAgAAAAAAAAAAAAAABFBvbGwAAAABAAAAAAAAAAVWb3RlcgAAAAAAAAEAAAAT",
        "AAAAAQAAAAAAAAAAAAAACFBvbGxEYXRhAAAABAAAAAAAAAAJaXNfYWN0aXZlAAAAAAAAAQAAAAAAAAAHb3B0aW9ucwAAAAPqAAAAEAAAAAAAAAAFdGl0bGUAAAAAAAAQAAAAAAAAAAV2b3RlcwAAAAAAA+wAAAAEAAAABA==" ]),
      options
    )
  }
  public readonly fromJSON = {
    init: this.txFromJSON<Result<void>>,
        vote: this.txFromJSON<Result<void>>,
        get_poll: this.txFromJSON<Result<PollData>>
  }
}