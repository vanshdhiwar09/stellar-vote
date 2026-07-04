/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  isConnected,
  isAllowed,
  setAllowed,
  getAddress,
  signTransaction,
} from '@stellar/freighter-api';
import { Client as VoteClient } from 'stellar_vote';
import type { PollData } from 'stellar_vote';
import { Networks } from '@stellar/stellar-sdk';

// ─── Constants (from .env) ───────────────────────────────────────────────────
const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID as string;
const RPC_URL = (import.meta.env.VITE_RPC_URL as string) || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE =
  (import.meta.env.VITE_NETWORK_PASSPHRASE as string) || Networks.TESTNET;

// ─── Types ────────────────────────────────────────────────────────────────────
export type TxStatus = 'IDLE' | 'PENDING' | 'SIGNED' | 'FAILED';

interface StellarContextType {
  walletAddress: string | null;
  isConnecting: boolean;
  txStatus: TxStatus;
  pollData: PollData | null;
  isPollLoading: boolean;
  pollError: string | null;
  connectWallet: () => Promise<void>;
  castVote: (optionIdx: number) => Promise<void>;
  refreshPoll: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const StellarContext = createContext<StellarContextType | undefined>(undefined);

// ─── Helper: build a contract client ─────────────────────────────────────────
function buildClient(publicKey?: string): VoteClient {
  return new VoteClient({
    contractId: CONTRACT_ID,
    rpcUrl: RPC_URL,
    networkPassphrase: NETWORK_PASSPHRASE,
    ...(publicKey ? { publicKey } : {}),
  });
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export const StellarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [txStatus, setTxStatus] = useState<TxStatus>('IDLE');
  const [pollData, setPollData] = useState<PollData | null>(null);
  const [isPollLoading, setIsPollLoading] = useState(true);
  const [pollError, setPollError] = useState<string | null>(null);

  // ── Read live poll data from the contract ─────────────────────────────────
  const refreshPoll = useCallback(async () => {
    if (!CONTRACT_ID) {
      setPollError('VITE_CONTRACT_ID is not set. Add your deployed contract ID to frontend/.env');
      setIsPollLoading(false);
      return;
    }
    try {
      setIsPollLoading(true);
      setPollError(null);
      const client = buildClient();
      const tx = await client.get_poll();
      const result = tx.result;
      if (result.isOk()) {
        setPollData(result.unwrap());
      } else {
        const err = result.unwrapErr();
        setPollError('Contract error: ' + err.message);
      }
    } catch (err) {
      console.error('get_poll failed:', err);
      setPollError('Failed to load poll data from the contract.');
    } finally {
      setIsPollLoading(false);
    }
  }, []);

  // Load poll on mount — refreshPoll is async, so no synchronous setState in the effect body
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { refreshPoll(); }, [refreshPoll]);

  // ── Connect Freighter wallet ───────────────────────────────────────────────
  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const connectionResult = await isConnected();
      if (!connectionResult.isConnected) {
        throw new Error('Freighter wallet extension is not installed. Please install it from freighter.app');
      }

      const allowedResult = await isAllowed();
      if (!allowedResult.isAllowed) {
        const grantResult = await setAllowed();
        if (!grantResult.isAllowed) {
          throw new Error('User denied access to Freighter wallet.');
        }
      }

      // Freighter v6: getAddress() returns { address, error? }
      const { address, error } = await getAddress();
      if (error || !address) {
        throw new Error(String(error ?? 'Could not retrieve address from Freighter.'));
      }

      setWalletAddress(address);
      setTxStatus('IDLE');
    } catch (err) {
      console.error('Wallet connection failed:', err);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  // ── Cast a vote on-chain ───────────────────────────────────────────────────
  const castVote = async (optionIdx: number) => {
    if (!walletAddress) {
      throw new Error('Please connect your wallet first.');
    }
    if (!CONTRACT_ID) {
      throw new Error('Contract ID is not configured.');
    }

    setTxStatus('PENDING');
    try {
      const client = buildClient(walletAddress);
      const tx = await client.vote({ voter: walletAddress, option_idx: optionIdx });

      await tx.signAndSend({
        signTransaction: async (xdr: string) => {
          // Freighter v6: signTransaction returns { signedTxXdr, signerAddress, error? }
          const result = await signTransaction(xdr, {
            networkPassphrase: NETWORK_PASSPHRASE,
          });
          if (result.error) {
            throw new Error(String(result.error));
          }
          return { signedTxXdr: result.signedTxXdr };
        },
      });

      setTxStatus('SIGNED');
      // Refresh to show updated vote counts
      await refreshPoll();
    } catch (err) {
      console.error('Vote failed:', err);
      setTxStatus('FAILED');
      throw err;
    }
  };

  return (
    <StellarContext.Provider value={{
      walletAddress,
      isConnecting,
      txStatus,
      pollData,
      isPollLoading,
      pollError,
      connectWallet,
      castVote,
      refreshPoll,
    }}>
      {children}
    </StellarContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useStellar = () => {
  const context = useContext(StellarContext);
  if (!context) throw new Error('useStellar must be used within a StellarProvider');
  return context;
};