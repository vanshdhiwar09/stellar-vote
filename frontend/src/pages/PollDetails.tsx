import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStellar } from '../context/StellarContext';
import { ArrowLeft, Rocket, Clock, Trophy } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444']; // Blue, Green, Purple, Amber, Red

export const PollDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { polls, isPollsLoading, castVote, txStatus, walletAddress } = useStellar();
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    const poll = polls.find(p => p.id.toString() === id);

    if (isPollsLoading) {
        return (
            <div className="max-w-[1200px] mx-auto w-full pb-10 flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4 animate-pulse fade-in">
                    <div className="w-12 h-12 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
                    <p className="text-slate-400 font-medium tracking-wide">Loading Poll Data...</p>
                </div>
            </div>
        );
    }

    if (!poll) {
        return (
            <div className="max-w-[1200px] mx-auto w-full py-20 text-center fade-in">
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
            const val = Number(arr[1]);
            votesMap.set(Number(arr[0]), val);
            totalVotes += val;
        });
    } else if (typeof rawVotes === 'object' && rawVotes !== null) {
        Object.entries(rawVotes).forEach(([k, v]) => {
            const val = Number(v);
            votesMap.set(Number(k), val);
            totalVotes += val;
        });
    }

    const chartData = poll.options.map((opt, idx) => ({
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
        <div className="max-w-[1200px] mx-auto w-full pb-10 fade-in">
            {/* Header Area */}
            <div className="mb-8">
                <Link to="/polls" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors mb-4">
                    <ArrowLeft size={16} /> Back to Polls
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-white tracking-tight">{poll.title}</h1>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${poll.is_active ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-slate-400 bg-slate-500/10 border border-slate-500/20'}`}>
                                {poll.is_active ? 'ACTIVE' : 'COMPLETED'}
                            </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-slate-400 font-medium">
                            <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-500" /> Created by: {poll.creator.slice(0, 6)}...{poll.creator.slice(-4)}</div>
                            <div className="flex items-center gap-1.5"><Trophy className="w-4 h-4 text-slate-500" /> Total Votes: {totalVotes}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column: Voting Area */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="bg-[#0a0a1f]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden h-full flex flex-col">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 blur-[60px] rounded-full pointer-events-none"></div>
                        <h3 className="text-white font-semibold mb-6">Cast Your Vote</h3>

                        <div className="space-y-3 mb-8 flex-1">
                            {poll.options.map((opt, idx) => {
                                const count = votesMap.get(idx) || 0;
                                const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                                const active = selectedOption === idx;

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => poll.is_active && setSelectedOption(idx)}
                                        className={`relative rounded-xl border flex items-center justify-between p-4 overflow-hidden transition-all group ${!poll.is_active ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'} ${active ? 'bg-blue-900/20 border-blue-500/50 shadow-[inset_0_0_20px_rgba(59,130,246,0.15)]' : 'bg-[#13132b]/80 border-white/5 hover:border-white/10 hover:bg-[#1a1a3a]/80'}`}
                                    >
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${active ? 'border-blue-400 bg-blue-500/20' : 'border-slate-600 bg-black/20'}`}>
                                                {active && <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />}
                                            </div>
                                            <span className={`font-medium ${active ? 'text-white' : 'text-slate-200'}`}>{opt}</span>
                                        </div>
                                        <span className="text-slate-400 text-sm relative z-10 font-medium">{pct}%</span>
                                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/5"></div>
                                        <div className={`absolute bottom-0 left-0 h-[2px] transition-all duration-1000 ${active ? 'bg-blue-500' : 'bg-indigo-500/50'}`} style={{ width: `${pct}%` }}></div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="border-t border-white/5 pt-6 mt-auto">
                            <button
                                onClick={handleVote}
                                disabled={txStatus === 'PENDING' || !poll.is_active || selectedOption === null}
                                className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-medium px-6 py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                <Rocket size={18} />
                                {txStatus === 'PENDING' ? 'Signing transaction...' : !poll.is_active ? 'Poll Closed' : selectedOption !== null ? `Vote for Option ${selectedOption + 1}` : 'Select an Option'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Analytics */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    <div className="bg-[#0a0a1f]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden h-[300px]">
                        <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
                            Live Results
                        </h3>
                        {totalVotes === 0 ? (
                            <div className="flex-1 h-full flex flex-col items-center justify-center text-slate-500">
                                <PieChart className="w-8 h-8 text-slate-600 mb-2 opacity-50" />
                                <span className="text-sm font-medium">No votes recorded yet</span>
                            </div>
                        ) : (
                            <div className="flex w-full h-[200px] items-center">
                                <div className="flex-1 h-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="votes"
                                                stroke="transparent"
                                            >
                                                {chartData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: '#13132b', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '12px', color: '#fff' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                                        <span className="text-2xl font-bold text-white">{totalVotes}</span>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col justify-center gap-3 pr-8">
                                    {chartData.map((opt, idx) => {
                                        const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                                        return (
                                            <div key={idx} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                                    <span className="text-slate-300 font-medium">{opt.name}</span>
                                                </div>
                                                <span className="text-slate-400 font-medium">{pct}% <span className="text-slate-600 text-xs ml-1">({opt.votes})</span></span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-[#0a0a1f]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden h-[300px]">
                        <h3 className="text-white font-semibold flex items-center gap-2 mb-2">
                            Option Comparison
                        </h3>
                        <div className="flex-1 w-full h-[220px] ml-[-20px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#64748b"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#64748b"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        allowDecimals={false}
                                    />
                                    <RechartsTooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                        contentStyle={{ backgroundColor: '#13132b', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '12px', color: '#fff' }}
                                    />
                                    <Bar
                                        dataKey="votes"
                                        radius={[6, 6, 0, 0]}
                                        barSize={32}
                                    >
                                        {chartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.9} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
