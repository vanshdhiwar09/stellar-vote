import { useState } from 'react';
import toast from 'react-hot-toast';
import { useStellar } from './context/StellarContext';
import { DashboardLayout } from './components/DashboardLayout';

// ─── Crypto option icon backgrounds ──────────────────────────────────────────
const OPTION_META: Record<string, { bg: string; symbol: string; border: string }> = {
  Soroban: { bg: 'from-violet-600 to-violet-800', symbol: 'S', border: 'rgba(139,92,246,0.5)' },
  Solana: { bg: 'from-teal-500   to-teal-700', symbol: 'S', border: 'rgba(20,184,166,0.5)' },
  Ethereum: { bg: 'from-blue-500   to-blue-700', symbol: 'Ξ', border: 'rgba(59,130,246,0.5)' },
};

const getOptionMeta = (name: string) =>
  OPTION_META[name] ?? { bg: 'from-slate-600 to-slate-800', symbol: name[0], border: 'rgba(148,163,184,0.3)' };

// ─── Safely convert Soroban votes map (handles Map, plain object, BigInt values) ───
function parseVotes(raw: unknown): Map<number, number> {
  const result = new Map<number, number>();
  if (!raw) return result;
  try {
    if (raw instanceof Map) {
      // Use forEach — safe even if keys are BigInt or xdr objects
      (raw as Map<unknown, unknown>).forEach((v, k) => {
        const numKey = Number(k);
        const numVal = Number(v);
        result.set(isNaN(numKey) ? 0 : numKey, isNaN(numVal) ? 0 : numVal);
      });
    } else if (typeof raw === 'object' && raw !== null) {
      for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
        const numKey = Number(k);
        const numVal = Number(v as number);
        result.set(isNaN(numKey) ? 0 : numKey, isNaN(numVal) ? 0 : numVal);
      }
    }
  } catch (e) {
    console.error('[parseVotes] failed to parse votes map:', raw, e);
  }
  return result;
}

// ─── Metric Card ──────────────────────────────────────────────────────────────
interface MetricCardProps {
  icon: string;
  iconBg: string;
  label: string;
  value: string;
  sub: string;
  sparkColor: string;
}

function MetricCard({ icon, iconBg, label, value, sub, sparkColor }: MetricCardProps) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center justify-between">
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br ${iconBg} shadow-lg`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: 'rgba(148,163,184,0.7)' }}>{label}</p>
        <p className="text-3xl font-bold text-white mt-1 tracking-tight">{value}</p>
        <p className="text-[11px] mt-1" style={{ color: 'rgba(148,163,184,0.6)' }}>{sub}</p>
      </div>
      {/* Mini sparkline */}
      <svg viewBox="0 0 100 28" className="w-full h-7 opacity-50">
        <polyline fill="none" stroke={sparkColor} strokeWidth="1.5"
          points="0,24 18,17 30,20 42,10 55,15 67,6 80,11 100,4" />
      </svg>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const { txStatus, walletAddress, pollData, isPollLoading, pollError, castVote } = useStellar();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const options = pollData?.options ?? [];
  const votesMap = parseVotes(pollData?.votes);
  const totalVotes = Array.from(votesMap.values()).reduce((a, b) => a + b, 0);

  const handleVote = async () => {
    if (!walletAddress) { toast.error('Connect your wallet first.'); return; }
    if (selectedOption === null) { toast.error('Select an option to vote for.'); return; }
    try {
      await castVote(selectedOption);
      toast.success('Vote recorded on Stellar! ✅');
      setSelectedOption(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // SimulationFailedError carries the contract error code as "Error(Contract, #N)"
      if (msg.includes('AlreadyVoted') || msg.includes('#4')) {
        toast.error('You already voted on this poll.');
      } else if (msg.includes('PollClosed') || msg.includes('#3')) {
        toast.error('This poll is no longer accepting votes.');
      } else if (msg.includes('InvalidOption') || msg.includes('#5')) {
        toast.error('Invalid option selected.');
      } else {
        toast.error('Transaction failed: ' + msg);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-7 text-white">

        {/* Page Title */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Voting Dashboard</h1>
          <span className="text-violet-400 text-lg">✦</span>
        </div>
        <p className="text-sm -mt-5" style={{ color: 'rgba(148,163,184,0.7)' }}>
          Interact with secure, on-chain polls managed by Soroban smart contracts.
        </p>

        {/* ── Metrics Row ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard icon="📋" iconBg="from-violet-600 to-indigo-700" label="Active Polls"
            value={isPollLoading ? '—' : pollData?.is_active ? '1' : '0'}
            sub="Live polls you can vote on" sparkColor="#818cf8" />
          <MetricCard icon="☑️" iconBg="from-blue-600 to-cyan-700" label="Completed Polls"
            value={isPollLoading ? '—' : pollData?.is_active ? '0' : '1'}
            sub="Polls that have ended" sparkColor="#38bdf8" />
          <MetricCard icon="🗳️" iconBg="from-emerald-600 to-teal-700" label="Total Votes Cast"
            value={isPollLoading ? '—' : totalVotes.toString()}
            sub="On-chain votes recorded" sparkColor="#34d399" />
          <MetricCard icon="👥" iconBg="from-fuchsia-600 to-purple-700" label="Total Participants"
            value="0"
            sub="Unique voters" sparkColor="#c084fc" />
        </div>

        {/* ── Content Grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

          {/* ── Poll Card ── */}
          <div className="xl:col-span-2 rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(139,92,246,0.25)' }}>

            {/* Poll header strip */}
            <div className="px-6 pt-6 pb-4 space-y-3"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(79,70,229,0.08) 100%)' }}>
              <div className="flex items-start gap-4">
                {/* Trophy icon */}
                <div className="h-12 w-12 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
                  🏆
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-white truncate">
                      {isPollLoading ? 'Loading poll...' : pollData?.title ?? 'Poll'}
                    </h2>
                    {pollData?.is_active && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase text-white"
                        style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
                        LIVE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(148,163,184,0.8)' }}>
                      <span className="text-violet-400">⬡</span>
                      Network: <span className="text-slate-300">Stellar Testnet</span>
                    </div>
                    <span className="h-1 w-1 rounded-full bg-slate-700" />
                    {pollData && (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase ${pollData.is_active
                        ? 'text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-400 border border-slate-700'
                        }`}
                        style={{ background: pollData.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)' }}>
                        {pollData.is_active ? 'ACTIVE' : 'CLOSED'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="px-6 py-5 space-y-3">
              {isPollLoading ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 rounded-xl bg-white/5" />
                  ))}
                </div>
              ) : pollError ? (
                <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <p className="font-semibold text-red-400 mb-1">Failed to load poll</p>
                  <p className="text-xs text-red-400/70">{pollError}</p>
                </div>
              ) : options.map((name, idx) => {
                const count = votesMap.get(idx) ?? 0;
                const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                const meta = getOptionMeta(name);
                const isSelected = selectedOption === idx;

                return (
                  <button key={idx} onClick={() => setSelectedOption(idx)}
                    disabled={txStatus === 'PENDING'}
                    className="w-full text-left rounded-xl px-4 py-3.5 transition-all duration-200 group"
                    style={{
                      background: isSelected ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isSelected ? meta.border : 'rgba(255,255,255,0.07)'}`,
                      boxShadow: isSelected ? `0 0 16px rgba(124,58,237,0.15)` : 'none',
                    }}>
                    <div className="flex items-center gap-4">
                      {/* Option icon */}
                      <div className={`h-10 w-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-sm text-white bg-gradient-to-br ${meta.bg}`}>
                        {meta.symbol}
                      </div>
                      {/* Option content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-white">{name}</span>
                          <span className="text-xs font-medium" style={{ color: 'rgba(148,163,184,0.7)' }}>
                            {count} {count === 1 ? 'Vote' : 'Votes'} ({pct}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                          <div
                            className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${meta.bg}`}
                            style={{ width: `${pct}%`, boxShadow: isSelected ? `0 0 8px rgba(124,58,237,0.5)` : 'none' }}
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action Footer */}
            <div className="px-6 pb-6 flex items-center justify-between flex-wrap gap-4">
              <button
                onClick={handleVote}
                disabled={txStatus === 'PENDING' || isPollLoading || !!pollError || selectedOption === null}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 0 20px rgba(124,58,237,0.35)' }}>
                🚀 {txStatus === 'PENDING' ? 'Signing...' : selectedOption !== null ? `Vote for Option ${selectedOption + 1}` : 'Select an Option'}
              </button>

              {/* Tx status badge */}
              <div className="flex items-center gap-2 text-xs">
                <span style={{ color: 'rgba(148,163,184,0.6)' }}>Transaction:</span>
                {txStatus === 'IDLE' && <span className="text-slate-500 font-medium">IDLE</span>}
                {txStatus === 'PENDING' && <span className="flex items-center gap-1.5 text-amber-400 font-semibold animate-pulse"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" />SIGNING...</span>}
                {txStatus === 'SIGNED' && <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-emerald-400" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>✅ SIGNED</span>}
                {txStatus === 'FAILED' && <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-red-400" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>❌ FAILED</span>}
              </div>
            </div>

            {/* Feature badges */}
            <div className="grid grid-cols-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              {[
                { icon: '🛡️', title: 'Transparent', desc: 'Every vote is recorded on-chain and publicly verifiable.' },
                { icon: '🔒', title: 'Secure', desc: 'Built with Soroban smart contracts on Stellar.' },
                { icon: '⚡', title: 'Decentralized', desc: 'No central authority. No single point of failure.' },
              ].map((f) => (
                <div key={f.title} className="p-4 flex flex-col gap-1.5" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-base">{f.icon}</span>
                    <span className="text-xs font-semibold text-white">{f.title}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(148,163,184,0.6)' }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="space-y-5">

            {/* On-Chain Activity */}
            <div className="rounded-2xl p-5 space-y-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2">
                <span>🚀</span>
                <h3 className="text-sm font-bold text-white">On-Chain Activity</h3>
              </div>
              <div className="relative pl-4 space-y-4 border-l" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                {walletAddress && (
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#0d0d2b] shadow-[0_0_8px_#34d399]" />
                    <p className="text-xs font-semibold text-white">Wallet Connected</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(148,163,184,0.6)' }}>
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)} · Just now
                    </p>
                  </div>
                )}
                <div className="relative">
                  <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-violet-500 border-2 border-[#0d0d2b]" />
                  <p className="text-xs font-semibold text-white">Poll Initialized</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(148,163,184,0.6)' }}>
                    {pollData?.title ?? '—'} · Testnet
                  </p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-blue-500 border-2 border-[#0d0d2b]" />
                  <p className="text-xs font-semibold text-white">Contract Deployed</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(148,163,184,0.6)' }}>Stellar Testnet · Phase 3</p>
                </div>
              </div>
              <button className="w-full mt-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(148,163,184,0.9)' }}>
                View All Activity →
              </button>
            </div>

            {/* Network Status */}
            <div className="rounded-2xl p-5 space-y-3"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2">
                <span>🌐</span>
                <h3 className="text-sm font-bold text-white">Network Status</h3>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
                    ⬡
                  </div>
                  <span className="text-sm font-semibold text-white">Stellar Testnet</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-400 tracking-widest"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
                  Active
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                {[
                  { icon: '⚡', label: 'Ledger', value: '28,453,921' },
                  { icon: '🔗', label: 'Protocol', value: '22' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <p className="text-[10px] font-medium mb-1" style={{ color: 'rgba(148,163,184,0.6)' }}>{s.icon} {s.label}</p>
                    <p className="text-sm font-bold text-white">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Secure by Design */}
            <div className="rounded-2xl p-5 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.1))', border: '1px solid rgba(139,92,246,0.25)' }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">🔐</span>
                <div>
                  <h3 className="text-sm font-bold text-white">Secure by Design</h3>
                  <p className="text-[11px] mt-1.5 leading-relaxed" style={{ color: 'rgba(148,163,184,0.7)' }}>
                    All polls are powered by Soroban smart contracts on Stellar. Transparent. Secure. Immutable.
                  </p>
                </div>
              </div>
              {/* Decorative glow orb */}
              <div className="absolute -bottom-6 -right-6 h-20 w-20 rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default App;