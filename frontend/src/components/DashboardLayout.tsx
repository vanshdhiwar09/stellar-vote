import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useStellar } from '../context/StellarContext';

const NAV_ITEMS = [
  { label: 'Overview', icon: '⊞' },
  { label: 'All Polls', icon: '◧', active: true },
  { label: 'Create Poll', icon: '+' },
  { label: 'Analytics', icon: '↗' },
];

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { walletAddress, connectWallet, isConnecting } = useStellar();
  const [darkMode] = useState(true);

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
    <div className="flex h-screen w-screen overflow-hidden font-sans"
      style={{ background: 'linear-gradient(135deg, #07071a 0%, #0d0d2b 50%, #07071a 100%)' }}>

      <Toaster position="top-right" toastOptions={{
        style: { background: '#13132b', color: '#e2e8f0', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '12px', fontSize: '13px' },
      }} />

      {/* ── Sidebar ── */}
      <aside className="w-60 flex-shrink-0 flex flex-col justify-between py-7 px-5 border-r"
        style={{ borderColor: 'rgba(139,92,246,0.15)', background: 'rgba(10,10,28,0.95)' }}>

        {/* Logo */}
        <div className="space-y-8">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <span className="font-bold text-base tracking-tight">
              <span className="text-white">Stellar</span>
              <span style={{ color: '#818cf8' }}>Vote</span>
            </span>
          </div>

          {/* Nav */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                className={`flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${item.active
                  ? 'text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                style={item.active ? {
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.5), rgba(79,70,229,0.4))',
                  border: '1px solid rgba(139,92,246,0.4)',
                } : {}}
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom: Network + Dark Mode */}
        <div className="space-y-4">
          <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Network</p>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
              <span className="text-xs font-medium text-slate-300">Stellar Testnet</span>
            </div>
            <button className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors">
              View on Explorer
              <span>↗</span>
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-slate-500">🌙 Dark Mode</span>
            <div className="relative w-10 h-5 rounded-full cursor-pointer"
              style={{ background: darkMode ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'rgba(255,255,255,0.1)' }}>
              <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-300 ${darkMode ? 'left-5' : 'left-0.5'}`} />
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-8 border-b"
          style={{ borderColor: 'rgba(139,92,246,0.1)', background: 'rgba(7,7,26,0.8)', backdropFilter: 'blur(12px)' }}>

          {/* Search */}
          <div className="relative w-72">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Global Search..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs text-slate-300 placeholder-slate-600 outline-none focus:ring-1 focus:ring-violet-500/40"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>

          {/* Wallet button */}
          {walletAddress ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-medium"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                <span className="text-slate-300">Connected: <span className="text-white font-mono">{shortAddr}</span></span>
                <span className="text-slate-500">⌄</span>
              </div>
              <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
                {walletAddress.slice(0, 1)}
              </div>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-200 disabled:opacity-50 hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 0 20px rgba(124,58,237,0.35)' }}
            >
              {isConnecting ? 'Connecting...' : '⚡ Connect Wallet'}
            </button>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};