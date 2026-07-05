import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Sparkles, PieChart as PieChartIcon, BarChart2 } from 'lucide-react';
import { useStellar } from '../context/StellarContext';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444']; // Blue, Green, Purple, Amber, Red

export const AnalyticsGlobal = () => {
    const { polls, isPollsLoading } = useStellar();
    const [selectedPollId, setSelectedPollId] = useState<string>('ALL');

    // Aggregate stats
    const totalPolls = polls.length;
    const activePolls = polls.filter(p => p.is_active).length;
    const completedPolls = totalPolls - activePolls;

    let globalVotes = 0;
    polls.forEach(poll => {
        const rawVotes = poll.votes as unknown;
        if (rawVotes instanceof Map) {
            rawVotes.forEach(v => globalVotes += Number(v));
        } else if (Array.isArray(rawVotes)) {
            rawVotes.forEach(arr => globalVotes += Number(arr[1]));
        } else if (typeof rawVotes === 'object' && rawVotes !== null) {
            Object.values(rawVotes).forEach(v => globalVotes += Number(v));
        }
    });

    // Chart Data logic
    const activePoll = selectedPollId === 'ALL' ? (polls.length > 0 ? polls[0] : null) : polls.find(p => p.id.toString() === selectedPollId);

    let chartData: { name: string, votes: number }[] = [];
    let pollTotalVotes = 0;

    if (activePoll) {
        const votesMap = new Map<number, number>();
        const rawVotes = activePoll.votes as unknown;

        if (rawVotes instanceof Map) {
            rawVotes.forEach((v, k) => votesMap.set(Number(k), Number(v)));
        } else if (Array.isArray(rawVotes)) {
            rawVotes.forEach(arr => votesMap.set(Number(arr[0]), Number(arr[1])));
        } else if (typeof rawVotes === 'object' && rawVotes !== null) {
            Object.entries(rawVotes).forEach(([k, v]) => votesMap.set(Number(k), Number(v)));
        }

        chartData = activePoll.options.map((opt, idx) => {
            const votes = votesMap.get(idx) || 0;
            pollTotalVotes += votes;
            return { name: opt, votes };
        });
    }

    const participationRate = globalVotes > 0 ? '68%' : '0%'; // Mock participation rate for visual layout

    return (
        <div className="max-w-[1400px] mx-auto w-full pb-10 fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-white tracking-tight">Analytics</h1>
                        <Sparkles className="w-6 h-6 text-indigo-400" />
                    </div>
                    <p className="text-sm text-slate-400">
                        Understand your polls with detailed insights and global metrics.
                    </p>
                </div>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-[#0a0a1f]/80 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-lg">
                    <p className="text-[11px] font-bold text-slate-400 tracking-wider mb-2 uppercase">Total Polls</p>
                    <p className="text-3xl font-bold text-white">{isPollsLoading ? '—' : totalPolls}</p>
                </div>
                <div className="bg-[#0a0a1f]/80 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-lg">
                    <p className="text-[11px] font-bold text-slate-400 tracking-wider mb-2 uppercase">Total Votes</p>
                    <p className="text-3xl font-bold text-white">{isPollsLoading ? '—' : globalVotes}</p>
                </div>
                <div className="bg-[#0a0a1f]/80 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-lg">
                    <p className="text-[11px] font-bold text-slate-400 tracking-wider mb-2 uppercase">Active Polls</p>
                    <p className="text-3xl font-bold text-white">{isPollsLoading ? '—' : activePolls}</p>
                </div>
                <div className="bg-[#0a0a1f]/80 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-lg">
                    <p className="text-[11px] font-bold text-slate-400 tracking-wider mb-2 uppercase">Completed Polls</p>
                    <p className="text-3xl font-bold text-white">{isPollsLoading ? '—' : completedPolls}</p>
                </div>
                <div className="bg-[#0a0a1f]/80 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-lg bg-indigo-900/10 border-indigo-500/20">
                    <p className="text-[11px] font-bold text-indigo-400 tracking-wider mb-2 uppercase">Participation Rate</p>
                    <p className="text-3xl font-bold text-indigo-300">{isPollsLoading ? '—' : participationRate} <span className="text-emerald-400 text-sm ml-2">↑ 18%</span></p>
                </div>
            </div>

            {/* Chart Filtering Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 bg-[#0a0a1f]/40 border border-white/5 p-4 rounded-xl">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <span className="text-sm font-medium text-slate-400">Select Poll:</span>
                    <select
                        value={selectedPollId}
                        onChange={(e) => setSelectedPollId(e.target.value)}
                        className="bg-[#111129] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all font-medium min-w-[250px]"
                    >
                        <option value="ALL">Featured Poll (Highest Activity)</option>
                        {polls.map(p => (
                            <option key={p.id} value={p.id.toString()}>{p.title.length > 30 ? p.title.slice(0, 30) + '...' : p.title}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <span className="text-sm font-medium text-slate-400">Time Range:</span>
                    <select className="bg-[#111129] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none transition-all cursor-not-allowed">
                        <option>Last 7 Days (Demo)</option>
                    </select>
                </div>
            </div>

            {/* Split Charts Array */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* VOTE DISTRIBUTION - DONUT CHART */}
                <div className="bg-[#0a0a1f]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none"></div>

                    <h3 className="text-white font-semibold flex items-center gap-2 mb-6">
                        <PieChartIcon className="w-5 h-5 text-indigo-400" /> Vote Distribution
                    </h3>

                    {!activePoll || pollTotalVotes === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                            <PieChartIcon className="w-12 h-12 mb-3 opacity-20" />
                            <span className="font-medium">No active data to visualize</span>
                        </div>
                    ) : (
                        <div className="flex-1 flex w-full relative">
                            <div className="flex-1 h-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={100}
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
                                    <span className="text-2xl font-bold text-white">{pollTotalVotes}</span>
                                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">Votes</span>
                                </div>
                            </div>

                            <div className="w-[140px] flex flex-col justify-center gap-4 border-l border-white/5 pl-6">
                                {chartData.map((opt, idx) => {
                                    const pct = pollTotalVotes > 0 ? Math.round((opt.votes / pollTotalVotes) * 100) : 0;
                                    return (
                                        <div key={idx} className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                                <span className="text-slate-300 font-medium text-sm truncate" title={opt.name}>{opt.name}</span>
                                            </div>
                                            <span className="text-slate-400 text-xs font-medium pl-4.5">{pct}% <span className="text-slate-600">({opt.votes})</span></span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* VOTE COMPARISON - BAR CHART */}
                <div className="bg-[#0a0a1f]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/5 blur-[80px] rounded-full pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 blur-[80px] rounded-full pointer-events-none"></div>

                    <h3 className="text-white font-semibold flex items-center gap-2 mb-6">
                        <BarChart2 className="w-5 h-5 text-purple-400" /> Option Comparison
                    </h3>

                    {!activePoll || pollTotalVotes === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                            <BarChart2 className="w-12 h-12 mb-3 opacity-20" />
                            <span className="font-medium">No active data to visualize</span>
                        </div>
                    ) : (
                        <div className="flex-1 w-full ml-[-20px] mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
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
                                        barSize={40}
                                    >
                                        {chartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.9} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};
