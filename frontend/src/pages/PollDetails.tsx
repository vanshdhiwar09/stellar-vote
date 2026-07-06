import { useState } from 'react';
import { ArrowLeft, Rocket, Clock, Trophy, Globe, Lock, Shield, ExternalLink } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';
import { useParams, Link } from 'react-router-dom';
import { useStellar } from '../context/StellarContext';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f43f5e', '#a855f7', '#0ea5e9']; // Expanded colors

export const PollDetails = () => {
    const { id } = useParams();
    const { polls, isPollsLoading, castVote, txStatus, walletAddress } = useStellar();
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    const poll = polls.find(p => p.id.toString() === id);

    if (isPollsLoading) {
        return (
            <div className="w-full pb-10 flex items-center justify-center flex-1">
                <div className="flex flex-col items-center gap-4 animate-pulse fade-in">
                    <div className="w-12 h-12 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
                    <p className="text-slate-400 font-medium tracking-wide">Loading Poll Data...</p>
                </div>
            </div>
        );
    }

    if (!poll) {
        return (
            <div className="w-full py-20 text-center fade-in flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">Poll Not Found</h1>
                <p className="text-slate-400 mb-8">This poll might not exist or may have been removed.</p>
                <Link to="/polls" className="text-indigo-400 hover:text-indigo-300 font-medium">← Back to All Polls</Link>
            </div>
        );
    }

    // Process votes data
    const rawVotes = poll.votes as unknown;
    let totalVotes = 0;
    const votesMap = new Map<number, number>();

    if (rawVotes instanceof Map) {
        rawVotes.forEach((v, k) => {
            const val = Number(v);
            votesMap.set(Number(k), val);
            totalVotes += val;
        });
    } else if (Array.isArray(rawVotes)) {
        rawVotes.forEach(arr => {
            if (Array.isArray(arr) && arr.length >= 2) {
                const val = Number(arr[1]);
                votesMap.set(Number(arr[0]), val);
                totalVotes += val;
            }
        });
    } else if (typeof rawVotes === 'object' && rawVotes !== null) {
        Object.entries(rawVotes).forEach(([k, v]) => {
            const val = Number(v);
            votesMap.set(Number(k), val);
            totalVotes += val;
        });
    }

    const chartData = poll.options.map((opt: string, idx: number) => ({
        name: opt,
        votes: votesMap.get(idx) || 0,
    }));

    const handleVote = async () => {
        if (!walletAddress) { toast.error('Connect your wallet first.'); return; }
        if (selectedOption === null) { toast.error('Select an option to vote for.'); return; }
        try {
            await castVote(poll.id, selectedOption);
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
        <div className="flex-1 w-full overflow-y-auto px-2 lg:px-6 pb-10 font-sans fade-in">
            <Toaster position="top-right" toastOptions={{
                style: { background: '#13132b', color: '#e2e8f0', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '12px', fontSize: '13px' },
            }} />

            <div className="max-w-[1400px] mx-auto">
                {/* Header Area */}
                <div className="mb-8">
                    <Link to="/polls" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors mb-6">
                        <ArrowLeft size={16} /> Back to Polls
                    </Link>

                    <div>
                        <div className="flex items-center gap-4 mb-3">
                            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{poll.title}</h1>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded border uppercase tracking-widest ${poll.is_active ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'text-slate-400 bg-slate-500/10 border-slate-500/20'}`}>
                                {poll.is_active ? 'ACTIVE' : 'COMPLETED'}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-400 font-medium">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-500" />
                                <span>Created by: <span className="text-slate-300">{poll.creator.slice(0, 6)}...{poll.creator.slice(-4)}</span></span>
                            </div>
                            <span className="text-slate-600 hidden sm:inline">•</span>
                            <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-slate-500" />
                                <span>Total Votes: <span className="text-slate-300">{totalVotes}</span></span>
                            </div>
                            <span className="text-slate-600 hidden sm:inline">•</span>
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-slate-500" />
                                <span>Network: <span className="text-slate-300 font-semibold">Stellar Testnet</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                    {/* Left Column: Voting Area */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-[#0a0a1f]/80 backdrop-blur-xl border border-white/5 rounded-[24px] p-7 shadow-2xl relative overflow-hidden h-full flex flex-col group">

                            {/* Subtle Background Glow */}
                            <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full pointer-events-none transition-opacity duration-700 opacity-50 group-hover:opacity-100"></div>

                            <h3 className="text-lg text-white font-bold mb-7 relative z-10">Cast Your Vote</h3>

                            <div className="space-y-4 mb-10 flex-1 relative z-10">
                                {poll.options.map((opt: string, idx: number) => {
                                    const count = votesMap.get(idx) || 0;
                                    const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                                    const active = selectedOption === idx;

                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => poll.is_active && setSelectedOption(idx)}
                                            className={`relative rounded-xl border flex items-center justify-between p-4 overflow-hidden transition-all duration-300 group/opt ${!poll.is_active ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'} ${active ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.1)]' : 'bg-[#111129]/60 border-white/5 hover:border-white/10 hover:bg-[#1a1a3a]/80'}`}
                                        >
                                            <div className="flex items-center gap-4 relative z-10">
                                                {/* Custom Radio Button */}
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${active ? 'border-2 border-indigo-400 bg-indigo-500/20' : 'border-2 border-slate-600 bg-black/20 group-hover/opt:border-slate-500'}`}>
                                                    {active && <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />}
                                                </div>
                                                <span className={`text-[15px] font-semibold transition-colors ${active ? 'text-white' : 'text-slate-200 group-hover/opt:text-white'}`}>{opt}</span>
                                            </div>

                                            <div className="relative z-10 flex items-center gap-1.5">
                                                <span className={`font-bold text-sm ${active ? 'text-indigo-300' : 'text-slate-300'}`}>{pct}%</span>
                                                <span className="text-slate-500 text-[11px] font-medium">({count})</span>
                                            </div>

                                            {/* Progress Bar Base */}
                                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5"></div>
                                            {/* Progress Bar Fill */}
                                            <div className={`absolute bottom-0 left-0 h-[2px] transition-all duration-1000 ease-out ${active ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]' : 'bg-indigo-500/30'}`} style={{ width: `${pct}%` }}></div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-auto relative z-10">
                                <button
                                    onClick={handleVote}
                                    disabled={txStatus === 'PENDING' || !poll.is_active || selectedOption === null}
                                    className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-semibold text-[15px] px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                                >
                                    <Rocket size={18} className={txStatus === 'PENDING' ? 'animate-bounce' : ''} />
                                    {txStatus === 'PENDING' ? 'Signing transaction...' : !poll.is_active ? 'Poll Closed' : selectedOption !== null ? `Vote for Option ${selectedOption + 1}` : 'Vote Now'}
                                </button>

                                <div className="flex items-center gap-1.5 justify-center text-slate-500 text-[11px] font-medium">
                                    <Lock size={12} />
                                    <span>Your vote is recorded on-chain and cannot be changed.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Middle Column: Analytics */}
                    <div className="lg:col-span-5 flex flex-col gap-6 lg:gap-8">

                        {/* Live Results Card */}
                        <div className="bg-[#0a0a1f]/80 backdrop-blur-xl border border-white/5 rounded-[24px] p-7 shadow-2xl relative overflow-hidden h-auto lg:h-[300px] flex flex-col">
                            <h3 className="text-base text-white font-bold mb-4 relative z-10">Live Results</h3>

                            {totalVotes === 0 ? (
                                <div className="flex-1 h-full flex flex-col items-center justify-center text-slate-500 relative z-10">
                                    <PieChart className="w-10 h-10 text-slate-600 mb-3 opacity-50" />
                                    <span className="text-sm font-medium">No votes recorded yet</span>
                                </div>
                            ) : (
                                <div className="flex flex-col xl:flex-row items-center w-full h-full relative z-10 gap-6 xl:gap-2">

                                    {/* Donut Chart */}
                                    <div className="w-full xl:w-1/2 h-[200px] relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={chartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={65}
                                                    outerRadius={85}
                                                    paddingAngle={6}
                                                    dataKey="votes"
                                                    stroke="none"
                                                    cornerRadius={4}
                                                >
                                                    {chartData.map((_: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip
                                                    contentStyle={{ backgroundColor: '#13132b', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                                                    itemStyle={{ color: '#fff', fontWeight: 500 }}
                                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col mt-1">
                                            <span className="text-2xl font-bold text-white tracking-tight">{totalVotes}</span>
                                            <span className="text-[11px] text-slate-400 font-medium mt-0.5">Total Votes</span>
                                        </div>
                                    </div>

                                    {/* Custom Legend */}
                                    <div className="w-full xl:w-1/2 flex flex-col justify-center gap-3 xl:pl-6 pb-2">
                                        {chartData.map((opt: { name: string; votes: number }, idx: number) => {
                                            const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                                            return (
                                                <div key={idx} className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length], boxShadow: `0 0 10px ${COLORS[idx % COLORS.length]}80` }}></div>
                                                        <span className="text-slate-200 font-semibold">{opt.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-white font-bold">{pct}%</span>
                                                        <span className="text-slate-500 text-xs font-medium w-5 text-right">({opt.votes})</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Option Comparison Card */}
                        <div className="bg-[#0a0a1f]/80 backdrop-blur-xl border border-white/5 rounded-[24px] p-7 shadow-2xl relative overflow-hidden flex-1 min-h-[260px]">
                            <h3 className="text-base text-white font-bold mb-6 relative z-10">Option Comparison</h3>

                            <div className="w-full h-[180px] ml-[-25px] relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#64748b"
                                            fontSize={12}
                                            fontWeight={500}
                                            tickLine={false}
                                            axisLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            stroke="#64748b"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            allowDecimals={false}
                                            dx={-10}
                                        />
                                        <RechartsTooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                            contentStyle={{ backgroundColor: '#13132b', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                                            itemStyle={{ fontWeight: 500 }}
                                        />
                                        <Bar
                                            dataKey="votes"
                                            radius={[4, 4, 0, 0]}
                                            barSize={28}
                                        >
                                            {chartData.map((_: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.95} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Details & Activity Sidebar */}
                    <div className="lg:col-span-3 flex flex-col gap-6 lg:gap-8">

                        {/* Poll Details Card */}
                        <div className="bg-[#0a0a1f]/80 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 shadow-2xl relative overflow-hidden">
                            <h3 className="text-base text-white font-bold mb-5">Poll Details</h3>
                            <div className="space-y-5">
                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-slate-400">Status</span>
                                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_#10b981]"></div> {poll.is_active ? 'Active' : 'Completed'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-slate-400">Creator</span>
                                    <span className="text-blue-400 font-medium">{poll.creator.slice(0, 6)}...{poll.creator.slice(-4)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-slate-400">Network</span>
                                    <span className="text-slate-200 font-medium">Stellar Testnet</span>
                                </div>
                            </div>
                        </div>

                        {/* Secure & Transparent Card */}
                        <div className="bg-[#0a0a1f]/80 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 shadow-2xl relative overflow-hidden flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <Shield size={16} className="text-blue-400" />
                                </div>
                                <h3 className="text-sm text-white font-bold">Secure & Transparent</h3>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                All votes are recorded on-chain using Soroban smart contracts. Every vote is verifiable and immutable.
                            </p>
                            <a href="https://stellar.expert/explorer/testnet/contract/CDFT2ZWORT3CIWKCJX2B4XK7QWK63KKWWLV4L7MCN6MC2TLCHSGQLD2I" target="_blank" rel="noreferrer" className="text-[11px] text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 mt-1 transition-colors w-fit">
                                View on Explorer <ExternalLink size={10} />
                            </a>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default PollDetails;
