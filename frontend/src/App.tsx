import { useState } from 'react';
import toast from 'react-hot-toast';
import { useStellar, type VoteEvent } from './context/StellarContext';
import { DashboardLayout } from './components/DashboardLayout';
import {
  Sparkles, FileText, CheckSquare, CheckCircle, Users, Trophy, Rocket, XCircle,
  Shield, Lock, Zap, Globe, Database, Cpu, ArrowRight
} from 'lucide-react';

function parseVotes(raw: unknown): Map<number, number> {
  const result = new Map<number, number>();
  if (!raw) return result;
  try {
    if (raw instanceof Map) {
      (raw as Map<unknown, unknown>).forEach((v, k) => {
        const numKey = Number(k);
        const numVal = Number(v);
        result.set(isNaN(numKey) ? 0 : numKey, isNaN(numVal) ? 0 : numVal);
      });
    } else if (Array.isArray(raw)) {
      // Soroban bindings often return Maps as Arrays of Tuples e.g. [[0, 1], [1, 2]]
      raw.forEach(item => {
        if (Array.isArray(item) && item.length >= 2) {
          const numKey = Number(item[0]);
          const numVal = Number(item[1]);
          result.set(isNaN(numKey) ? 0 : numKey, isNaN(numVal) ? 0 : numVal);
        }
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

export default function App() {
  const { txStatus, walletAddress, pollData, isPollLoading, pollError, castVote, recentEvents } = useStellar();
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
      <div className="max-w-[1400px] mx-auto w-full pb-10">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-white tracking-tight">Voting Dashboard</h1>
          <Sparkles className="w-6 h-6 text-indigo-400" />
        </div>
        <p className="text-sm text-slate-400 mb-8">
          Interact with secure, on-chain polls managed by Soroban smart contracts.
        </p>

        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="ACTIVE POLLS" value={isPollLoading ? '—' : pollData?.is_active ? '1' : '0'} subtitle="Live polls you can vote on" icon={<FileText className="w-5 h-5 text-indigo-400" />} iconBg="bg-indigo-500/10 border-indigo-500/20" />
          <StatCard title="COMPLETED POLLS" value={isPollLoading ? '—' : pollData?.is_active ? '0' : '1'} subtitle="Polls that have ended" icon={<CheckSquare className="w-5 h-5 text-blue-400" />} iconBg="bg-blue-500/10 border-blue-500/20" />
          <StatCard title="TOTAL VOTES CAST" value={isPollLoading ? '—' : totalVotes.toString()} subtitle="On-chain votes recorded" icon={<CheckCircle className="w-5 h-5 text-emerald-400" />} iconBg="bg-emerald-500/10 border-emerald-500/20" />
          <StatCard title="TOTAL PARTICIPANTS" value="0" subtitle="Unique voters" icon={<Users className="w-5 h-5 text-purple-400" />} iconBg="bg-purple-500/10 border-purple-500/20" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">
          <div className="xl:col-span-8 flex flex-col gap-6">

            {/* POLL CARD */}
            <div className="bg-[#0a0a1f]/80 backdrop-blur-md border border-white/5 rounded-2xl p-7 relative overflow-hidden flex flex-col shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full pointer-events-none"></div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px] shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                      <div className="w-full h-full bg-[#13132b] rounded-xl flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-purple-400" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-white tracking-wide">
                          {isPollLoading ? 'Loading poll...' : pollData?.title ?? 'Poll'}
                        </h2>
                        {pollData?.is_active && (
                          <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider shadow-[0_0_10px_rgba(37,99,235,0.4)]">Live</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-sm text-slate-400">Network: <span className="text-slate-300 font-medium">Stellar Testnet</span></span>
                        <span className="text-slate-600">•</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${pollData?.is_active ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-slate-400 bg-slate-500/10 border border-slate-500/20'}`}>
                          {pollData?.is_active ? 'Active' : 'Closed'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3.5 mb-8">
                  {isPollLoading ? (
                    <div className="space-y-4 animate-pulse">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 rounded-xl bg-white/5" />
                      ))}
                    </div>
                  ) : pollError ? (
                    <div className="rounded-xl p-4 text-sm bg-red-500/10 border border-red-500/20">
                      <p className="font-semibold text-red-500 mb-1">Failed to load poll</p>
                      <p className="text-xs text-red-400/80">{pollError}</p>
                    </div>
                  ) : (
                    options.map((name, idx) => {
                      const count = votesMap.get(idx) ?? 0;
                      const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                      const active = selectedOption === idx;

                      // Using the precise styling requested by user
                      let iconRender;
                      if (name === "Soroban") iconRender = <div className="text-indigo-400 font-bold text-lg font-serif italic">S</div>;
                      else if (name === "Solana") iconRender = <div className="flex flex-col gap-[3px] items-center justify-center w-full h-full rotate-[-45deg] scale-75"><div className="w-5 h-1 bg-emerald-400 rounded-sm"></div><div className="w-5 h-1 bg-emerald-400 rounded-sm"></div><div className="w-5 h-1 bg-emerald-400 rounded-sm"></div></div>;
                      else iconRender = <svg width="14" height="22" viewBox="0 0 14 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.99984 0L6.95117 0.165V15.021L6.99984 15.07L13.882 10.999L6.99984 0Z" fill="#C9CCDA" /><path d="M7.00016 0L0.118164 10.999L7.00016 15.07V0Z" fill="#8890B5" /><path d="M6.99984 16.2959L6.97266 16.329V21.758L6.99984 22.0001L13.885 12.228L6.99984 16.2959Z" fill="#C9CCDA" /><path d="M7.00016 22.0001V16.2959L0.118164 12.228L7.00016 22.0001Z" fill="#8890B5" /></svg>;

                      return (
                        <div key={idx} onClick={() => setSelectedOption(idx)} className={`relative rounded-xl border flex items-center justify-between p-4 overflow-hidden transition-all group cursor-pointer ${active ? 'bg-blue-900/20 border-blue-500/50 shadow-[inset_0_0_20px_rgba(59,130,246,0.15)]' : 'bg-[#13132b]/80 border-white/5 hover:border-white/10 hover:bg-[#1a1a3a]/80'
                          }`}>
                          <div className="flex items-center gap-4 relative z-10">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-blue-500/20' : 'bg-white/5'}`}>
                              {iconRender}
                            </div>
                            <span className={`font-medium ${active ? 'text-white' : 'text-slate-200'}`}>{name}</span>
                          </div>
                          <span className="text-slate-400 text-sm relative z-10">{count} {count === 1 ? 'Vote' : 'Votes'} ({pct}%)</span>

                          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5"></div>
                          <div className={`absolute bottom-0 left-0 h-[2px] transition-all duration-1000 ${active ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)]' : 'bg-gradient-to-r from-blue-500/50 to-indigo-500/50'
                            }`} style={{ width: `${pct}%` }}></div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-6">
                  <button
                    onClick={handleVote}
                    disabled={txStatus === 'PENDING' || isPollLoading || !!pollError || selectedOption === null}
                    className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-medium px-6 py-3 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    <Rocket className="w-4 h-4" />
                    {txStatus === 'PENDING' ? 'Signing...' : selectedOption !== null ? `Vote for Option ${selectedOption + 1}` : 'Select an Option'}
                  </button>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">Transaction:</span>
                    {txStatus === 'IDLE' && <div className="text-slate-500 text-[11px] font-bold tracking-wider">IDLE</div>}
                    {txStatus === 'PENDING' && <div className="text-amber-400 flex items-center gap-1.5 text-[11px] font-bold tracking-wider animate-pulse"><div className="w-2 h-2 bg-amber-400 rounded-full" /> PENDING</div>}
                    {txStatus === 'SIGNED' && <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider"><CheckCircle className="w-3.5 h-3.5" /> SIGNED</div>}
                    {txStatus === 'FAILED' && <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-500 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider"><XCircle className="w-3.5 h-3.5" /> FAILED</div>}
                  </div>
                </div>
              </div>
            </div>

            {/* FEATURES LIST */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FeatureItem icon={<Shield className="w-5 h-5 text-blue-400" />} title="Transparent" desc="Every vote is recorded on-chain and publicly verifiable." bgColor="bg-blue-500/10" />
              <FeatureItem icon={<Lock className="w-5 h-5 text-amber-400" />} title="Secure" desc="Built with Soroban smart contracts on Stellar." bgColor="bg-amber-500/10" />
              <FeatureItem icon={<Zap className="w-5 h-5 text-orange-400" />} title="Decentralized" desc="No central authority. No single point of failure." bgColor="bg-orange-500/10" />
            </div>

          </div>

          <div className="xl:col-span-4 flex flex-col gap-6">

            {/* ACTIVITY CARD */}
            <div className="bg-[#0a0a1f]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-lg">
              <h3 className="text-white font-semibold mb-7 flex items-center gap-2 text-sm">
                <Rocket className="w-4 h-4 text-purple-400" /> On-Chain Activity
              </h3>

              <div className="relative pl-7 border-l border-white/10 space-y-7 ml-3 pb-2">
                {recentEvents.length > 0 ? (
                  recentEvents.map((ev: VoteEvent) => (
                    <ActivityItem
                      key={ev.id}
                      status="success"
                      title="New Vote Cast"
                      subtitle={`${ev.voter.slice(0, 6)}...${ev.voter.slice(-4)} voted for Option ${ev.optionIdx + 1}`}
                    />
                  ))
                ) : (
                  <>
                    {walletAddress && <ActivityItem status="success" title="Wallet Connected" subtitle={`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} • Just now`} />}
                    <ActivityItem status="active" title="Poll Initialized" subtitle={`${pollData?.title ?? '—'} • Testnet`} />
                    <ActivityItem status="pending" title="Contract Deployed" subtitle="Stellar Testnet • Phase 3" />
                  </>
                )}
              </div>

              <button className="w-full mt-8 bg-[#111129] hover:bg-[#1a1a3a] transition-colors border border-white/5 rounded-xl py-3 text-xs font-semibold text-slate-300 flex items-center justify-center gap-2">
                View All Activity <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* NETWORK CARD */}
            <div className="bg-[#0a0a1f]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-lg">
              <h3 className="text-white font-semibold mb-5 flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-blue-400" /> Network Status
              </h3>

              <div className="bg-[#111129] border border-white/5 rounded-xl p-4 mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-white font-medium text-sm">Stellar Testnet</span>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">Active</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-500" />
                  <span className="text-slate-400 text-xs font-medium">Ledger: <span className="text-slate-200">28,453,921</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-500" />
                  <span className="text-slate-400 text-xs font-medium">Protocol: <span className="text-slate-200">22</span></span>
                </div>
              </div>
            </div>

            {/* SECURE CARD */}
            <div className="bg-gradient-to-br from-[#0c0c22] to-[#140f2d] border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden flex items-center shadow-lg min-h-[140px]">
              <div className="z-10 w-3/4 pr-4">
                <h3 className="text-white font-semibold flex items-center gap-2 mb-2 text-sm">
                  <Lock className="w-4 h-4 text-slate-300" /> Secure by Design
                </h3>
                <p className="text-slate-400 text-[11px] leading-relaxed font-medium">
                  All polls are powered by Soroban smart contracts on Stellar. Transparent. Secure. Immutable.
                </p>
              </div>
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-600/30 blur-[40px] rounded-full pointer-events-none"></div>
              <div className="z-10 absolute right-4 top-1/2 -translate-y-1/2 opacity-90 relative flex items-center justify-center pointer-events-none">
                <Shield className="w-20 h-20 text-purple-500 drop-shadow-[0_0_20px_rgba(168,85,247,0.7)] stroke-[1.5]" />
                <Lock className="w-7 h-7 text-white absolute" />
                <div className="absolute w-28 h-8 border border-purple-400/30 rounded-[100%] rotate-[20deg]"></div>
                <div className="absolute w-28 h-8 border border-purple-400/30 rounded-[100%] -rotate-[20deg]"></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const StatCard = ({ title, value, subtitle, icon, iconBg }: { title: string, value: string, subtitle: string, icon: React.ReactNode, iconBg: string }) => (
  <div className="bg-[#0a0a1f]/80 backdrop-blur-md border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-white/10 transition-colors shadow-lg">
    <div className="relative z-10 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${iconBg}`}>
          {icon}
        </div>
        <h3 className="text-[11px] font-bold text-slate-300 tracking-wider uppercase">{title}</h3>
      </div>
      <div className="mt-auto">
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-xs text-slate-500 font-medium">{subtitle}</div>
      </div>
    </div>
  </div>
)

const FeatureItem = ({ icon, title, desc, bgColor }: { icon: React.ReactNode, title: string, desc: string, bgColor: string }) => (
  <div className="bg-[#0a0a1f]/80 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex gap-4 hover:border-white/10 transition-colors shadow-lg">
    <div className={`w-10 h-10 shrink-0 rounded-xl ${bgColor} flex items-center justify-center mt-0.5`}>
      {icon}
    </div>
    <div>
      <h4 className="text-white font-semibold mb-1.5 text-sm">{title}</h4>
      <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{desc}</p>
    </div>
  </div>
)

const ActivityItem = ({ status, title, subtitle }: { status: string, title: string, subtitle: string }) => {
  const colors = {
    success: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]',
    active: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]',
    pending: 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]',
  }
  return (
    <div className="relative">
      <div className={`absolute -left-[35px] top-1 w-3.5 h-3.5 rounded-full border-[3px] border-[#0a0a1f] ${colors[status as keyof typeof colors]}`}></div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-[11px] text-slate-500 mt-1 font-medium">{subtitle}</p>
    </div>
  )
}