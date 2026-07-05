import { Home, BarChart2, PlusCircle, LineChart, ExternalLink, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Sidebar = () => {
    const location = useLocation();

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
                <NavItem to="/" icon={<Home size={18} />} label="Overview" active={location.pathname === '/'} />
                <NavItem to="/polls" icon={<BarChart2 size={18} />} label="All Polls" active={location.pathname === '/polls' || location.pathname.startsWith('/poll/')} />
                <NavItem to="/polls/create" icon={<PlusCircle size={18} />} label="Create Poll" active={location.pathname === '/polls/create'} />
                <NavItem to="/analytics" icon={<LineChart size={18} />} label="Analytics" active={location.pathname === '/analytics'} />
            </nav>

            {/* Bottom widgets */}
            <div className="mt-auto space-y-4">
                <div className="bg-[#0f0f23] border border-white/5 rounded-xl p-4">
                    <p className="text-xs text-slate-500 font-medium mb-2">Network</p>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                        <span className="text-sm text-white font-medium">Stellar Testnet</span>
                    </div>
                    <a
                        href="https://stellar.expert/explorer/testnet/contract/CDFT2ZWORT3CIWKCJX2B4XK7QWK63KKWWLV4L7MCN6MC2TLCHSGQLD2I"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 bg-[#171733] hover:bg-[#1f1f45] transition-colors rounded-lg flex items-center justify-center gap-2 text-xs text-slate-300 font-medium border border-white/5"
                    >
                        View on Explorer <ExternalLink size={14} />
                    </a>
                </div>
            </div>
        </div>
    );
}

const NavItem = ({ icon, label, active = false, to }: { icon: React.ReactNode, label: string, active?: boolean, to: string }) => {
    if (active) {
        return (
            <Link to={to} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600/20 to-transparent border-l-[3px] border-blue-500 text-white cursor-pointer relative overflow-hidden shadow-[inset_20px_0_20px_-20px_rgba(59,130,246,0.3)] block decoration-transparent">
                <div className="text-blue-400">{icon}</div>
                <span className="text-sm font-semibold">{label}</span>
            </Link>
        );
    }
    return (
        <Link to={to} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer transition-all border-l-[3px] border-transparent block decoration-transparent">
            <div>{icon}</div>
            <span className="text-sm font-medium">{label}</span>
        </Link>
    );
};
