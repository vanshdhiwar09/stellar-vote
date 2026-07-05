import { useState } from 'react';
import { BarChart2, Search, Filter, Users, Trophy } from 'lucide-react';
import { useStellar } from '../context/StellarContext';
import { Link } from 'react-router-dom';

export const AllPolls = () => {
    const { polls, isPollsLoading } = useStellar();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

    const filteredPolls = polls.filter(poll => {
        const matchesSearch = poll.title.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'ALL'
            ? true
            : filter === 'ACTIVE'
                ? poll.is_active
                : !poll.is_active;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="max-w-[1400px] mx-auto w-full pb-10 fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-white tracking-tight">All Polls</h1>
                        <BarChart2 className="w-6 h-6 text-indigo-400" />
                    </div>
                    <p className="text-sm text-slate-400">
                        Browse all polls created on StellarVote.
                    </p>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-[#0a0a1f]/80 backdrop-blur-md border border-white/5 p-4 rounded-2xl shadow-lg">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search polls..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#111129] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 text-sm text-slate-400 mr-2">
                        <Filter className="w-4 h-4" /> Filter:
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="bg-[#111129] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all cursor-pointer font-medium"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active Only</option>
                        <option value="COMPLETED">Completed Only</option>
                    </select>
                </div>
            </div>

            {/* Polls Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isPollsLoading ? (
                    [1, 2, 3, 4].map(i => (
                        <div key={i} className="h-56 bg-white/5 animate-pulse rounded-2xl border border-white/5"></div>
                    ))
                ) : filteredPolls.length > 0 ? (
                    filteredPolls.map(poll => {
                        const rawVotes = poll.votes as unknown;
                        let totalVotes = 0;
                        if (rawVotes instanceof Map) {
                            rawVotes.forEach(v => totalVotes += Number(v));
                        } else if (Array.isArray(rawVotes)) {
                            rawVotes.forEach(arr => totalVotes += Number(arr[1]));
                        } else if (typeof rawVotes === 'object' && rawVotes !== null) {
                            Object.values(rawVotes).forEach(v => totalVotes += Number(v));
                        }

                        return (
                            <Link to={`/poll/${poll.id}`} key={poll.id} className="bg-[#0a0a1f]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl hover:border-white/10 hover:bg-[#111129]/90 transition-all group flex flex-col items-start cursor-pointer relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[50px] rounded-full group-hover:bg-blue-600/10 transition-colors pointer-events-none"></div>

                                <div className="flex items-start justify-between w-full mb-4 relative z-10">
                                    <h2 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">{poll.title}</h2>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider h-fit shrink-0 ml-4 ${poll.is_active ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-slate-400 bg-slate-500/10 border border-slate-500/20'}`}>
                                        {poll.is_active ? 'ACTIVE' : 'COMPLETED'}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400 mb-6 line-clamp-2 relative z-10">
                                    Vote on chain to determine the outcome for {poll.title}. Cast your vote securely using Freighter.
                                </p>

                                <div className="mt-auto w-full flex items-center gap-6 border-t border-white/5 pt-5 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-slate-500" />
                                        <span className="text-xs font-semibold text-slate-300">{totalVotes} Votes</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Trophy className="w-4 h-4 text-slate-500" />
                                        <span className="text-xs font-semibold text-slate-300">{poll.options.length} Options</span>
                                    </div>
                                    <div className="ml-auto text-indigo-400 text-xs font-bold tracking-wide group-hover:translate-x-1 transition-transform">
                                        View Poll →
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-3xl bg-[#0a0a1f]/30">
                        <BarChart2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">No Polls Found</h3>
                        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">There are currently no polls matching your criteria or no polls have been deployed.</p>
                        <Link to="/polls/create" className="inline-block bg-indigo-500/20 text-indigo-400 font-medium px-6 py-2.5 rounded-xl border border-indigo-500/30 hover:bg-indigo-500/30 transition-all text-sm">
                            Create the first poll
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
