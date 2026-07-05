/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  isConnected,
  isAllowed,
  setAllowed,
  getAddress,
  signTransaction,
} from '@stellar/freighter-api';
import { Client as VoteClient } from 'stellar_vote';
import type { PollData } from 'stellar_vote';
import { Networks, rpc, scValToNative } from '@stellar/stellar-sdk';

const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID as string;
const RPC_URL = (import.meta.env.VITE_RPC_URL as string) || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE =
  (import.meta.env.VITE_NETWORK_PASSPHRASE as string) || Networks.TESTNET;

export type TxStatus = 'IDLE' | 'PENDING' | 'SIGNED' | 'FAILED';

export interface VoteEvent {
  id: string;
  voter: string;
  pollId: number;
  optionIdx: number;
  ledger: number;
  createdAt: string;
}

interface StellarContextType {
  walletAddress: string | null;
  isConnecting: boolean;
  txStatus: TxStatus;
  polls: PollData[];
  isPollsLoading: boolean;
  pollsError: string | null;
  recentEvents: VoteEvent[];
  connectWallet: () => Promise<void>;
  createPoll: (title: string, options: string[]) => Promise<void>;
  castVote: (pollId: number, optionIdx: number) => Promise<void>;
  refreshPolls: () => Promise<void>;
}

const StellarContext = createContext<StellarContextType | undefined>(undefined);

function buildClient(publicKey?: string): VoteClient {
  return new VoteClient({
    contractId: CONTRACT_ID,
    rpcUrl: RPC_URL,
    networkPassphrase: NETWORK_PASSPHRASE,
    ...(publicKey ? { publicKey } : {}),
  });
}

export const StellarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [txStatus, setTxStatus] = useState<TxStatus>('IDLE');

  const [polls, setPolls] = useState<PollData[]>([]);
  const [isPollsLoading, setIsPollsLoading] = useState(true);
  const [pollsError, setPollsError] = useState<string | null>(null);
  const [recentEvents, setRecentEvents] = useState<VoteEvent[]>([]);
  const lastLedgerRef = useRef<number | null>(null);

  const refreshPolls = useCallback(async () => {
    if (!CONTRACT_ID) {
      setPollsError('VITE_CONTRACT_ID is not set.');
      setIsPollsLoading(false);
      return;
    }
    try {
      setIsPollsLoading(true);
      setPollsError(null);
      const client = buildClient();
      const tx = await client.get_polls();
      const result = tx.result;
      if (result) {
        setPolls(result);
      }
    } catch (err) {
      console.error('get_polls failed:', err);
      setPollsError('Failed to load polls from the contract.');
    } finally {
      setIsPollsLoading(false);
    }
  }, []);

  useEffect(() => { refreshPolls(); }, [refreshPolls]);

  useEffect(() => {
    if (!CONTRACT_ID) return;
    const server = new rpc.Server(RPC_URL);

    const pollEvents = async () => {
      try {
        if (!lastLedgerRef.current) {
          const res = await server.getLatestLedger();
          lastLedgerRef.current = res.sequence;
          return;
        }

        const response = await server.getEvents({
          startLedger: lastLedgerRef.current,
          filters: [{ type: 'contract', contractIds: [CONTRACT_ID] }]
        });

        if (response.events && response.events.length > 0) {
          let hasNewActivity = false;

          for (const ev of response.events) {
            try {
              const eventName = scValToNative(ev.topic[0]);

              if (eventName === 'vote_cast') {
                const pollId = scValToNative(ev.topic[1]);
                const optionIdx = scValToNative(ev.topic[2]);
                const voter = scValToNative(ev.value);

                setRecentEvents(prev => {
                  if (prev.some(e => e.id === ev.id)) return prev;
                  return [{
                    id: ev.id,
                    voter: String(voter),
                    pollId: Number(pollId),
                    optionIdx: Number(optionIdx),
                    ledger: ev.ledger,
                    createdAt: ev.ledgerClosedAt || new Date().toISOString()
                  }, ...prev].slice(0, 20);
                });
                hasNewActivity = true;
              } else if (eventName === 'poll_created') {
                hasNewActivity = true;
              }
            } catch (e) {
              console.error('Failed to parse event', e, ev);
            }
          }

          if (hasNewActivity) refreshPolls();
        }

        if (response.latestLedger) {
          lastLedgerRef.current = response.latestLedger + 1;
        }
      } catch (err: any) {
        if (err?.response?.data?.error?.code === -32600 || String(err).includes('startLedger must be within')) {
          lastLedgerRef.current = null;
        }
      }
    };

    const timer = setInterval(pollEvents, 4000);
    return () => clearInterval(timer);
  }, [refreshPolls]);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const connectionResult = await isConnected();
      if (!connectionResult.isConnected) throw new Error('Freighter wallet extension is not installed.');
      const allowedResult = await isAllowed();
      if (!allowedResult.isAllowed) {
        const grantResult = await setAllowed();
        if (!grantResult.isAllowed) throw new Error('User denied access to Freighter wallet.');
      }
      const { address, error } = await getAddress();
      if (error || !address) throw new Error(String(error ?? 'Could not retrieve address.'));
      setWalletAddress(address);
      setTxStatus('IDLE');
    } catch (err) {
      console.error('Wallet connection failed:', err);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  const createPoll = async (title: string, options: string[]) => {
    if (!walletAddress) throw new Error('Please connect your wallet first.');
    if (!CONTRACT_ID) throw new Error('Contract ID is not configured.');
    setTxStatus('PENDING');
    try {
      const client = buildClient(walletAddress);

      const tx = await client.create_poll({
        creator: walletAddress,
        title,
        poll_options: options
      });

      await tx.signAndSend({
        signTransaction: async (xdr: string) => {
          const result = await signTransaction(xdr, { networkPassphrase: NETWORK_PASSPHRASE });
          if (result.error) throw new Error(String(result.error));
          return { signedTxXdr: result.signedTxXdr };
        },
      });
      setTxStatus('SIGNED');
      await refreshPolls();
    } catch (err) {
      console.error('Create Poll failed:', err);
      setTxStatus('FAILED');
      throw err;
    }
  };

  const castVote = async (pollId: number, optionIdx: number) => {
    if (!walletAddress) throw new Error('Please connect your wallet first.');
    if (!CONTRACT_ID) throw new Error('Contract ID is not configured.');
    setTxStatus('PENDING');
    try {
      const client = buildClient(walletAddress);
      const tx = await client.vote({ voter: walletAddress, poll_id: pollId, option_idx: optionIdx });

      await tx.signAndSend({
        signTransaction: async (xdr: string) => {
          const result = await signTransaction(xdr, { networkPassphrase: NETWORK_PASSPHRASE });
          if (result.error) throw new Error(String(result.error));
          return { signedTxXdr: result.signedTxXdr };
        },
      });
      setTxStatus('SIGNED');
      await refreshPolls();
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
      polls,
      isPollsLoading,
      pollsError,
      recentEvents,
      connectWallet,
      createPoll,
      castVote,
      refreshPolls,
    }}>
      {children}
    </StellarContext.Provider>
  );
};

export const useStellar = () => {
  const context = useContext(StellarContext);
  if (!context) throw new Error('useStellar must be used within a StellarProvider');
  return context;
};