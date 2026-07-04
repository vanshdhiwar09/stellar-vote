import React, { useState } from 'react';
import { Home, BarChart2, PlusCircle, LineChart, Moon, ExternalLink, Sparkles } from 'lucide-react';

export const Sidebar = () => {
    const [darkMode, setDarkMode] = useState(true);

    return (
        <div className="w-[260px] flex-shrink-0 flex flex-col h-full bg-[#050511]/40 border-r border-white/5 backdrop-blur-xl relative z-10 pt-6 px-4 pb-4">
            {/* Logo */}
            <div className="flex items-center gap-3 px-2 mb-10">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white tracking-wide">
                    Stellar<span className="text-indigo-400">Vote</span>
                </span>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1.5">
                <NavItem icon={<Home size={18} />} label="Overview" />
                <NavItem icon={<BarChart2 size={18} />} label="All Polls" active />
                <NavItem icon={<PlusCircle size={18} />} label="Create Poll" />
                <NavItem icon={<LineChart size={18} />} label="Analytics" />
            </nav>

            {/* Bottom widgets */}
            <div className="mt-auto space-y-4">
                <div className="bg-[#0f0f23] border border-white/5 rounded-xl p-4">
                    <p className="text-xs text-slate-500 font-medium mb-2">Network</p>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                        <span className="text-sm text-white font-medium">Stellar Testnet</span>
                    </div>
                    <button className="w-full py-2 bg-[#171733] hover:bg-[#1f1f45] transition-colors rounded-lg flex items-center justify-center gap-2 text-xs text-slate-300 font-medium border border-white/5">
                        View on Explorer <ExternalLink size={14} />
                    </button>
                </div>

                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Moon size={16} />
                        <span className="text-sm font-medium">Dark Mode</span>
                    </div>
                    {/* Toggle Switch */}
                    <div
                        onClick={() => setDarkMode(!darkMode)}
                        className="w-10 h-5 bg-indigo-600 rounded-full relative cursor-pointer flex items-center px-1 shadow-[0_0_10px_rgba(79,70,229,0.3)] transition-all"
                    >
                        <div className={`w-3.5 h-3.5 bg-white rounded-full absolute shadow-sm transition-all duration-300 ${darkMode ? 'right-1' : 'left-1 bg-slate-200'}`}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => {
    if (active) {
        return (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600/20 to-transparent border-l-[3px] border-blue-500 text-white cursor-pointer relative overflow-hidden shadow-[inset_20px_0_20px_-20px_rgba(59,130,246,0.3)]">
                <div className="text-blue-400">{icon}</div>
                <span className="text-sm font-semibold">{label}</span>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer transition-all border-l-[3px] border-transparent">
            <div>{icon}</div>
            <span className="text-sm font-medium">{label}</span>
        </div>
    );
};
