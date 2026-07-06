import { useState } from 'react';
import { Users, CheckCircle, FileText, CheckSquare, ArrowRight, Trophy, Rocket } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStellar, type VoteEvent } from '../context/StellarContext';
import { Link, useNavigate } from 'react-router-dom';

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

export const Overview = () => {
    const { txStatus, walletAddress, polls, isPollsLoading, pollsError, castVote, recentEvents } = useStellar();
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const navigate = useNavigate();

    const featuredPoll = polls.length > 0 ? polls[0] : null;
    const options = featuredPoll?.options ?? [];
    const votesMap = parseVotes(featuredPoll?.votes);
    const totalVotes = Array.from(votesMap.values()).reduce((a, b) => a + b, 0);

    const handleVote = async (pollId: number) => {
        if (!walletAddress) { toast.error('Connect your wallet first.'); return; }
        if (selectedOption === null) { toast.error('Select an option to vote for.'); return; }
        try {
            await castVote(pollId, selectedOption);
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
        <div className="max-w-[1400px] mx-auto w-full pb-10 fade-in overflow-y-auto font-sans">
            <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
                <Trophy className="w-6 h-6 text-[#6b3ce2]" />
            </div>
            <p className="text-sm text-slate-400 mb-8">
                Welcome back! Here's what's happening with your polls.
            </p>

            {/* STATS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="TOTAL POLLS"
                    value={isPollsLoading ? '—' : polls.length.toString()}
                    subtitle="Active and completed"
                    icon={<FileText className="w-5 h-5 text-indigo-400" />}
                    colorTheme="indigo"
                />
                <StatCard
                    title="ACTIVE POLLS"
                    value={isPollsLoading ? '—' : polls.filter(p => p.is_active).length.toString()}
                    subtitle="Live polls you can vote on"
                    icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}
                    colorTheme="emerald"
                />
                <StatCard
                    title="COMPLETED POLLS"
                    value={isPollsLoading ? '—' : polls.filter(p => !p.is_active).length.toString()}
                    subtitle="Polls that have ended"
                    icon={<CheckSquare className="w-5 h-5 text-blue-400" />}
                    colorTheme="blue"
                />
                <StatCard
                    title="TOTAL VOTES CAST"
                    value={isPollsLoading ? '—' : totalVotes.toString()}
                    subtitle="On-chain votes recorded"
                    icon={<Users className="w-5 h-5 text-[#8651fe]" />}
                    colorTheme="purple"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8 flex flex-col gap-6">

                    {/* FEATURED POLL CARD */}
                    <div className="bg-[#0a0a1f]/80 backdrop-blur-md border border-white/5 rounded-2xl p-7 relative overflow-hidden flex flex-col shadow-xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-start justify-between mb-8">
                                <div className="flex gap-4 items-center">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6b3ce2]/20 to-[#41399e]/20 p-[1px] shadow-[0_0_15px_rgba(107,60,226,0.15)] border border-[#6b3ce2]/30">
                                        <div className="w-full h-full bg-[#0a0a1f] rounded-xl flex items-center justify-center">
                                            <Trophy className="w-6 h-6 text-[#8651fe]" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-xl font-bold text-white tracking-wide">
                                                {isPollsLoading ? 'Loading Featured Poll...' : featuredPoll?.title ?? 'No Polls Available'}
                                            </h2>
                                            {featuredPoll?.is_active && (
                                                <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-[0_0_10px_rgba(37,99,235,0.4)]">Live</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-sm text-slate-400">Network: <span className="text-slate-300 font-medium">Stellar Testnet</span></span>
                                            <span className="text-slate-600">•</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${featuredPoll?.is_active ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-slate-400 bg-slate-500/10 border border-slate-500/20'}`}>
                                                {featuredPoll?.is_active ? 'Active' : 'Closed'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3.5 mb-8">
                                {isPollsLoading ? (
                                    <div className="space-y-4 animate-pulse">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-16 rounded-xl bg-white/5" />
                                        ))}
                                    </div>
                                ) : pollsError ? (
                                    <div className="rounded-xl p-4 text-sm bg-red-500/10 border border-red-500/20">
                                        <p className="font-semibold text-red-500 mb-1">Failed to load poll</p>
                                        <p className="text-xs text-red-400/80">{pollsError}</p>
                                    </div>
                                ) : (
                                    options.map((name: string, idx: number) => {
                                        const count = votesMap.get(idx) ?? 0;
                                        const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                                        const active = selectedOption === idx;

                                        return (
                                            <div key={idx} onClick={() => featuredPoll?.is_active && setSelectedOption(idx)} className={`relative rounded-xl border flex items-center justify-between p-4 overflow-hidden transition-all group ${featuredPoll?.is_active ? 'cursor-pointer' : 'opacity-80 cursor-not-allowed'} ${active ? 'bg-purple-900/10 border-purple-500/40 shadow-[inset_0_0_20px_rgba(134,81,254,0.1)]' : 'bg-[#0f0f24]/80 border-white/5 hover:border-white/10 hover:bg-[#151532]/80'
                                                }`}>
                                                <div className="flex items-center gap-4 relative z-10">
                                                    <div className={`w-3 h-3 rounded-full transition-all ${active ? 'bg-[#8651fe] shadow-[0_0_12px_rgba(134,81,254,0.9)]' : 'bg-slate-600'}`}>
                                                    </div>
                                                    <span className={`font-medium ${active ? 'text-white' : 'text-slate-300'}`}>{name}</span>
                                                </div>
                                                <span className="text-slate-400 text-sm relative z-10">{count} {count === 1 ? 'Vote' : 'Votes'} ({pct}%)</span>

                                                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/5"></div>
                                                <div className={`absolute bottom-0 left-0 h-[3px] transition-all duration-1000 ${active ? 'bg-[#8651fe] shadow-[0_0_10px_rgba(134,81,254,1)]' : 'bg-[#41399e]/40'
                                                    }`} style={{ width: `${pct}%` }}></div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-6">
                                <button
                                    onClick={() => featuredPoll && handleVote(featuredPoll.id)}
                                    disabled={txStatus === 'PENDING' || isPollsLoading || !!pollsError || selectedOption === null || !featuredPoll || !featuredPoll.is_active}
                                    className="bg-gradient-to-r from-[#6b3ce2] to-[#41399e] hover:from-[#7a4cff] hover:to-[#5248c8] text-white font-medium px-6 py-3 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(107,60,226,0.3)] transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed border border-[#8651fe]/30">
                                    <Rocket className="w-4 h-4" />
                                    {txStatus === 'PENDING' ? 'Signing...' : !featuredPoll?.is_active ? 'Poll Closed' : 'Vote Now'}
                                </button>

                                <div className="flex items-center gap-3">
                                    <Link to={`/poll/${featuredPoll?.id ?? ''}`} className="text-[#8651fe] hover:text-[#9e74ff] text-sm tracking-wide font-medium flex items-center gap-1 transition-colors">
                                        View Details <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-4 flex flex-col gap-6">

                    {/* ACTIVITY CARD */}
                    <div className="bg-[#0a0a1f]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-lg h-full flex flex-col">
                        <h3 className="text-white font-semibold mb-7 flex items-center gap-2 text-sm">
                            <Rocket className="w-4 h-4 text-[#8651fe]" /> Recent Activity
                        </h3>

                        <div className="relative pl-7 border-l border-white/10 space-y-7 ml-3 pb-2 flex-1">
                            {recentEvents.length > 0 ? (
                                recentEvents.slice(0, 5).map((ev: VoteEvent) => (
                                    <ActivityItem
                                        key={ev.id}
                                        status="success"
                                        title="New Vote Cast"
                                        subtitle={`${ev.voter.slice(0, 6)}...${ev.voter.slice(-4)} voted for Option ${ev.optionIdx + 1}`}
                                        rightText="Just now"
                                    />
                                ))
                            ) : (
                                <>
                                    {walletAddress && <ActivityItem status="success" title="New Vote Cast" subtitle={`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} voted for Option 1`} rightText="Just now" />}
                                    <ActivityItem status="success" title="New Vote Cast" subtitle={`GAGHIC..TXNW voted for Option 2`} rightText="2m ago" />
                                </>
                            )}
                        </div>

                        {recentEvents.length === 0 && !walletAddress && (
                            <div className="mt-8 pt-6 border-t border-white/5">
                                <p className="text-xs text-slate-500 text-center">Connect wallet to see events...</p>
                            </div>
                        )}

                        <button onClick={() => navigate('/analytics')} className="w-full mt-6 bg-transparent hover:bg-white/5 border border-white/10 rounded-xl py-3 text-xs font-medium text-slate-300 flex items-center justify-center gap-2 transition-colors">
                            View All Activity <ArrowRight className="w-4 h-4" />
                        </button>

                    </div>

                </div>
            </div>
        </div>
    );
}

const StatCard = ({ title, value, subtitle, icon, colorTheme }: { title: string, value: string, subtitle: string, icon: React.ReactNode, colorTheme: 'indigo' | 'emerald' | 'blue' | 'purple' }) => {

    // Style configurations based on theme to mimic glassmorphic logo glow
    const themes = {
        indigo: {
            bg: "bg-indigo-950/20",
            border: "border-indigo-500/20",
            glow: "shadow-[inset_0_0_40px_rgba(99,102,241,0.05)]",
            iconBg: "bg-indigo-500/10 border-indigo-500/20",
        },
        emerald: {
            bg: "bg-emerald-950/20",
            border: "border-emerald-500/20",
            glow: "shadow-[inset_0_0_40px_rgba(16,185,129,0.05)]",
            iconBg: "bg-emerald-500/10 border-emerald-500/20",
        },
        blue: {
            bg: "bg-blue-950/20",
            border: "border-blue-500/20",
            glow: "shadow-[inset_0_0_40px_rgba(59,130,246,0.05)]",
            iconBg: "bg-blue-500/10 border-blue-500/20",
        },
        purple: {
            bg: "bg-purple-950/20",
            border: "border-purple-500/20",
            glow: "shadow-[inset_0_0_40px_rgba(168,85,247,0.05)]",
            iconBg: "bg-purple-500/10 border-purple-500/20",
        }
    };

    const theme = themes[colorTheme];

    return (
        <div className={`backdrop-blur-md rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors shadow-lg ${theme.bg} border ${theme.border} ${theme.glow}`}>
            <div className="relative z-10 flex flex-col h-full gap-5">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${theme.iconBg}`}>
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-[10px] font-bold text-slate-300 tracking-wider uppercase mb-1">{title}</h3>
                        <div className="text-3xl font-bold text-white">{value}</div>
                    </div>
                </div>
                <div className="mt-auto">
                    <div className="text-xs text-slate-400 font-medium">{subtitle}</div>
                </div>
            </div>
        </div>
    )
}

const ActivityItem = ({ status, title, subtitle, rightText }: { status: string, title: string, subtitle: string, rightText?: string }) => {
    const colors = {
        success: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]',
        active: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]',
        pending: 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]',
    }
    return (
        <div className="relative flex justify-between items-start">
            <div>
                <div className={`absolute -left-[35px] top-1 w-3.5 h-3.5 rounded-full border-[3px] border-[#0a0a1f] ${colors[status as keyof typeof colors]}`}></div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">{subtitle}</p>
            </div>
            {rightText && (
                <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap ml-4">{rightText}</span>
            )}
        </div>
    )
}
