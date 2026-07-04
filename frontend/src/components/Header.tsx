import React from 'react';
import toast from 'react-hot-toast';
import { useStellar } from '../context/StellarContext';
import { Search, ChevronDown, Wallet } from 'lucide-react';

export const Header: React.FC = () => {
    const { walletAddress, connectWallet, isConnecting } = useStellar();

    const handleConnect = async () => {
        try {
            await connectWallet();
            toast.success('Wallet connected!');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes('not installed')) {
                toast.error('Freighter not found. Install it at freighter.app 🔌', { duration: 5000 });
            } else if (msg.includes('denied')) {
                toast.error('Wallet access denied. Please approve in Freighter.');
            } else {
                toast.error('Could not connect: ' + msg);
            }
        }
    };

    const shortAddr = walletAddress
        ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
        : null;

    return (
        <header className="h-20 shrink-0 flex items-center justify-between px-8 border-b border-white/5 bg-[#07071a]/30 backdrop-blur-md">
            {/* Search */}
            <div className="relative w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    type="text"
                    placeholder="Global Search..."
                    className="w-full bg-[#111129] border border-white/5 rounded-full pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                {walletAddress ? (
                    <>
                        <div className="bg-[#111129] border border-white/5 rounded-full pl-4 pr-3 py-2 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                            <span className="text-xs text-slate-300 font-semibold tracking-wide">Connected: {shortAddr}</span>
                            <ChevronDown size={14} className="text-slate-500 ml-1" />
                        </div>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/10 shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer">
                            {walletAddress.slice(0, 1)}
                        </div>
                    </>
                ) : (
                    <button
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-medium px-6 py-2.5 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all text-sm disabled:opacity-50"
                    >
                        <Wallet className="w-4 h-4" /> {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                )}
            </div>
        </header>
    );
};
