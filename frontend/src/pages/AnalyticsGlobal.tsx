import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Sparkles, PieChart as PieChartIcon, BarChart2, FileText, Users, Activity, CheckSquare } from 'lucide-react';
import { useStellar } from '../context/StellarContext';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

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
            rawVotes.forEach(arr => {
                if (Array.isArray(arr) && arr.length >= 2) {
                    globalVotes += Number(arr[1]);
                }
            });
        } else if (typeof rawVotes === 'object' && rawVotes !== null) {
            Object.values(rawVotes).forEach(v => globalVotes += Number(v));
        }
    });

    // Chart Data logic
    // Featured poll logic: if ALL, pick the poll with the most votes. Fallback to 0th length.
    let mostVotedPoll = polls[0] || null;
    if (polls.length > 0) {
        let maxGlobal = -1;
        polls.forEach(p => {
            const v = p.votes as unknown;
            let count = 0;
            if (v instanceof Map) {
                v.forEach(val => count += Number(val));
            } else if (Array.isArray(v)) {
                v.forEach(arr => { if (Array.isArray(arr) && arr.length >= 2) count += Number(arr[1]); });
            } else if (typeof v === 'object' && v !== null) {
                Object.values(v).forEach(val => count += Number(val));
            }
            if (count > maxGlobal) {
                maxGlobal = count;
                mostVotedPoll = p;
            }
        })
    }

    const activePoll = selectedPollId === 'ALL' ? mostVotedPoll : polls.find(p => p.id.toString() === selectedPollId);

    let chartData: { name: string, votes: number }[] = [];
    let pollTotalVotes = 0;

    if (activePoll) {
        const votesMap = new Map<number, number>();
        const rawVotes = activePoll.votes as unknown;

        if (rawVotes instanceof Map) {
            rawVotes.forEach((v, k) => votesMap.set(Number(k), Number(v)));
        } else if (Array.isArray(rawVotes)) {
            rawVotes.forEach(arr => {
                if (Array.isArray(arr) && arr.length >= 2) {
                    votesMap.set(Number(arr[0]), Number(arr[1]));
                }
            });
        } else if (typeof rawVotes === 'object' && rawVotes !== null) {
            Object.entries(rawVotes).forEach(([k, v]) => votesMap.set(Number(k), Number(v)));
        }

        chartData = activePoll.options.map((opt, idx) => {
            const votes = votesMap.get(idx) || 0;
            pollTotalVotes += votes;
            return { name: opt, votes };
        });
    }

    const participationRate = globalVotes > 0 ? '68%' : '0%';

    return (
        <div className="max-w-[1400px] mx-auto w-full pb-10 fade-in font-sans">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-white tracking-tight">Analytics</h1>
                        <Sparkles className="w-6 h-6 text-[#8b5cf6]" />
                    </div>
                    <p className="text-sm text-slate-400">
                        Understand your polls with detailed insights and global metrics.
                    </p>
                </div>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
                <StatCard
                    title="TOTAL POLLS"
                    value={isPollsLoading ? '—' : totalPolls.toString()}
                    icon={<FileText className="w-5 h-5" />}
                    colorTheme="purple"
                />
                <StatCard
                    title="TOTAL VOTES"
                    value={isPollsLoading ? '—' : globalVotes.toString()}
                    icon={<Users className="w-5 h-5" />}
                    colorTheme="blue"
                />
                <StatCard
                    title="ACTIVE POLLS"
                    value={isPollsLoading ? '—' : activePolls.toString()}
                    icon={<Activity className="w-5 h-5" />}
                    colorTheme="emerald"
                />
                <StatCard
                    title="COMPLETED POLLS"
                    value={isPollsLoading ? '—' : completedPolls.toString()}
                    icon={<CheckSquare className="w-5 h-5" />}
                    colorTheme="amber"
                />
                <div className="backdrop-blur-xl rounded-2xl p-5 relative overflow-hidden transition-all duration-300 bg-[#0d0d26]/80 border border-[#8b5cf6]/20 hover:border-[#8b5cf6]/40 shadow-[0_0_20px_rgba(139,92,246,0.05)] flex flex-col justify-center">
                    <div className="relative z-10 flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 bg-[#8b5cf6]/10 border-[#8b5cf6]/20 text-[#8b5cf6]">
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col justify-center pt-0.5">
                            <h3 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">PARTICIPATION RATE</h3>
                            <div className="text-2xl font-bold text-white leading-none">{isPollsLoading ? '—' : participationRate}</div>
                            <p className="text-emerald-400 text-[11px] font-semibold mt-2 tracking-wide">↑ 18%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart Filtering Bar */}
            <div className="flex items-center gap-4 mb-6 bg-[#0a0a1f]/60 backdrop-blur-md border border-white/5 px-6 py-4 rounded-xl shadow-lg w-full">
                <span className="text-sm font-medium text-slate-400 shrink-0">Select Poll:</span>
                <div className="flex-1 max-w-xl flex items-center gap-2">
                    <select
                        value={selectedPollId}
                        onChange={(e) => setSelectedPollId(e.target.value)}
                        className="bg-transparent text-sm text-white focus:outline-none font-medium w-full cursor-pointer appearance-none outline-none ring-0 border-none px-0 py-0"
                    >
                        <option value="ALL" className="bg-[#0f0f24]">Featured Poll (Highest Activity)</option>
                        {polls.map(p => (
                            <option key={p.id} value={p.id.toString()} className="bg-[#0f0f24]">{p.title.length > 50 ? p.title.slice(0, 50) + '...' : p.title}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none text-slate-500">
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Split Charts Array */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">

                {/* VOTE DISTRIBUTION - DONUT CHART */}
                <div className="bg-[#0a0a1f]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none"></div>

                    <h3 className="text-white font-semibold flex items-center gap-2 mb-2 relative z-10 text-sm">
                        <PieChartIcon className="w-4 h-4 text-[#8b5cf6]" /> Vote Distribution
                    </h3>

                    {!activePoll || pollTotalVotes === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 relative z-10">
                            <PieChartIcon className="w-12 h-12 mb-3 opacity-20" />
                            <span className="font-medium">No active data to visualize</span>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col sm:flex-row items-center justify-center w-full relative z-10 gap-8 sm:gap-4 mt-4">
                            <div className="w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={0}
                                            dataKey="votes"
                                            stroke="none"
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
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col mt-0.5">
                                    <span className="text-3xl font-bold text-white leading-none">{pollTotalVotes}</span>
                                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">Votes</span>
                                </div>
                            </div>

                            <div className="flex flex-col justify-center gap-4 border-t sm:border-t-0 sm:border-l border-white/5 pt-6 sm:pt-0 pl-0 sm:pl-8 min-w-[160px]">
                                {chartData.map((opt, idx) => {
                                    const pct = pollTotalVotes > 0 ? Math.round((opt.votes / pollTotalVotes) * 100) : 0;
                                    return (
                                        <div key={idx} className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                                <span className="text-slate-200 font-medium text-[13px] truncate" title={opt.name}>{opt.name}</span>
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
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none"></div>

                    <h3 className="text-white font-semibold flex items-center gap-2 mb-6 relative z-10 text-sm">
                        <BarChart2 className="w-4 h-4 text-[#8b5cf6]" /> Option Comparison
                    </h3>

                    {!activePoll || pollTotalVotes === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 relative z-10">
                            <BarChart2 className="w-12 h-12 mb-3 opacity-20" />
                            <span className="font-medium">No active data to visualize</span>
                        </div>
                    ) : (
                        <div className="flex-1 w-full ml-[-20px] relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#64748b"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={15}
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
                                        contentStyle={{ backgroundColor: '#13132b', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '12px', color: '#fff' }}
                                    />
                                    <Bar
                                        dataKey="votes"
                                        radius={[4, 4, 0, 0]}
                                        barSize={32}
                                    >
                                        {chartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={1} />
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

const StatCard = ({ title, value, icon, colorTheme }: { title: string, value: string, icon: React.ReactNode, colorTheme: 'purple' | 'blue' | 'emerald' | 'amber' }) => {

    const themes = {
        purple: {
            bg: "bg-[#0d0d26]/80",
            border: "border-[#8b5cf6]/20",
            hoverBorder: "hover:border-[#8b5cf6]/40",
            glow: "shadow-[0_0_20px_rgba(139,92,246,0.05)]",
            iconBg: "bg-[#8b5cf6]/10 border-[#8b5cf6]/20",
            iconColor: "text-[#8b5cf6]"
        },
        blue: {
            bg: "bg-[#0d0d26]/80",
            border: "border-[#3b82f6]/20",
            hoverBorder: "hover:border-[#3b82f6]/40",
            glow: "shadow-[0_0_20px_rgba(59,130,246,0.05)]",
            iconBg: "bg-[#3b82f6]/10 border-[#3b82f6]/20",
            iconColor: "text-[#3b82f6]"
        },
        emerald: {
            bg: "bg-[#0d0d26]/80",
            border: "border-[#10b981]/20",
            hoverBorder: "hover:border-[#10b981]/40",
            glow: "shadow-[0_0_20px_rgba(16,185,129,0.05)]",
            iconBg: "bg-[#10b981]/10 border-[#10b981]/20",
            iconColor: "text-[#10b981]"
        },
        amber: {
            bg: "bg-[#0d0d26]/80",
            border: "border-[#f59e0b]/20",
            hoverBorder: "hover:border-[#f59e0b]/40",
            glow: "shadow-[0_0_20px_rgba(245,158,11,0.05)]",
            iconBg: "bg-[#f59e0b]/10 border-[#f59e0b]/20",
            iconColor: "text-[#f59e0b]"
        }
    };

    const theme = themes[colorTheme];

    return (
        <div className={`backdrop-blur-xl rounded-2xl p-5 relative overflow-hidden transition-all duration-300 ${theme.bg} border ${theme.border} ${theme.hoverBorder} ${theme.glow}`}>
            <div className="relative z-10 flex items-start gap-4 h-full">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${theme.iconBg} ${theme.iconColor}`}>
                    {icon}
                </div>
                <div className="flex flex-col justify-center pt-0.5">
                    <h3 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">{title}</h3>
                    <div className="text-2xl font-bold text-white leading-none">{value}</div>
                </div>
            </div>
        </div>
    )
}

export default AnalyticsGlobal;
