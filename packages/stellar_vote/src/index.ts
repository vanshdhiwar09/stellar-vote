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


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CDFT2ZWORT3CIWKCJX2B4XK7QWK63KKWWLV4L7MCN6MC2TLCHSGQLD2I",
  }
} as const

export const Errors = {
  1: {message:"AlreadyInitialized"},
  2: {message:"NotInitialized"},
  3: {message:"PollClosed"},
  4: {message:"AlreadyVoted"},
  5: {message:"InvalidOption"}
}

export type DataKey = {tag: "PollCounter", values: void} | {tag: "Poll", values: readonly [u32]} | {tag: "Voter", values: readonly [u32, string]};


export interface PollData {
  creator: string;
  id: u32;
  is_active: boolean;
  options: Array<string>;
  title: string;
  votes: Map<u32, u32>;
}

export interface Client {
  /**
   * Construct and simulate a vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Casts a vote for a specific option on a specific poll
   */
  vote: ({voter, poll_id, option_idx}: {voter: string, poll_id: u32, option_idx: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_poll transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Fetches a specific poll by ID
   */
  get_poll: ({poll_id}: {poll_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<PollData>>>

  /**
   * Construct and simulate a get_polls transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Fetches all active polls mapped in storage (Note: scales poorly unbound, but good for demo sizing)
   */
  get_polls: (options?: MethodOptions) => Promise<AssembledTransaction<Array<PollData>>>

  /**
   * Construct and simulate a create_poll transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Creates a brand new poll on the network and assigns it a unique ID
   */
  create_poll: ({creator, title, poll_options}: {creator: string, title: string, poll_options: Array<string>}, options?: MethodOptions) => Promise<AssembledTransaction<Result<u32>>>

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
      new ContractSpec([ "AAAAAAAAADVDYXN0cyBhIHZvdGUgZm9yIGEgc3BlY2lmaWMgb3B0aW9uIG9uIGEgc3BlY2lmaWMgcG9sbAAAAAAAAAR2b3RlAAAAAwAAAAAAAAAFdm90ZXIAAAAAAAATAAAAAAAAAAdwb2xsX2lkAAAAAAQAAAAAAAAACm9wdGlvbl9pZHgAAAAAAAQAAAABAAAD6QAAA+0AAAAAAAAAAw==",
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAABQAAAAAAAAASQWxyZWFkeUluaXRpYWxpemVkAAAAAAABAAAAAAAAAA5Ob3RJbml0aWFsaXplZAAAAAAAAgAAAAAAAAAKUG9sbENsb3NlZAAAAAAAAwAAAAAAAAAMQWxyZWFkeVZvdGVkAAAABAAAAAAAAAANSW52YWxpZE9wdGlvbgAAAAAAAAU=",
        "AAAAAAAAAB1GZXRjaGVzIGEgc3BlY2lmaWMgcG9sbCBieSBJRAAAAAAAAAhnZXRfcG9sbAAAAAEAAAAAAAAAB3BvbGxfaWQAAAAABAAAAAEAAAPpAAAH0AAAAAhQb2xsRGF0YQAAAAM=",
        "AAAAAAAAAGJGZXRjaGVzIGFsbCBhY3RpdmUgcG9sbHMgbWFwcGVkIGluIHN0b3JhZ2UgKE5vdGU6IHNjYWxlcyBwb29ybHkgdW5ib3VuZCwgYnV0IGdvb2QgZm9yIGRlbW8gc2l6aW5nKQAAAAAACWdldF9wb2xscwAAAAAAAAAAAAABAAAD6gAAB9AAAAAIUG9sbERhdGE=",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAAAAAAAAAAAC1BvbGxDb3VudGVyAAAAAAEAAAAAAAAABFBvbGwAAAABAAAABAAAAAEAAAAAAAAABVZvdGVyAAAAAAAAAgAAAAQAAAAT",
        "AAAAAQAAAAAAAAAAAAAACFBvbGxEYXRhAAAABgAAAAAAAAAHY3JlYXRvcgAAAAATAAAAAAAAAAJpZAAAAAAABAAAAAAAAAAJaXNfYWN0aXZlAAAAAAAAAQAAAAAAAAAHb3B0aW9ucwAAAAPqAAAAEAAAAAAAAAAFdGl0bGUAAAAAAAAQAAAAAAAAAAV2b3RlcwAAAAAAA+wAAAAEAAAABA==",
        "AAAAAAAAAEJDcmVhdGVzIGEgYnJhbmQgbmV3IHBvbGwgb24gdGhlIG5ldHdvcmsgYW5kIGFzc2lnbnMgaXQgYSB1bmlxdWUgSUQAAAAAAAtjcmVhdGVfcG9sbAAAAAADAAAAAAAAAAdjcmVhdG9yAAAAABMAAAAAAAAABXRpdGxlAAAAAAAAEAAAAAAAAAAMcG9sbF9vcHRpb25zAAAD6gAAABAAAAABAAAD6QAAAAQAAAAD" ]),
      options
    )
  }
  public readonly fromJSON = {
    vote: this.txFromJSON<Result<void>>,
        get_poll: this.txFromJSON<Result<PollData>>,
        get_polls: this.txFromJSON<Array<PollData>>,
        create_poll: this.txFromJSON<Result<u32>>
  }
}