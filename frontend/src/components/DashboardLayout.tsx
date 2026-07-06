import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full font-sans text-slate-200 antialiased"
      style={{ background: 'linear-gradient(135deg, #07071a 0%, #0d0d2b 50%, #07071a 100%)' }}>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
      `}</style>

      <Toaster position="top-right" toastOptions={{
        style: { background: '#13132b', color: '#e2e8f0', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '12px', fontSize: '13px' },
      }} />

      <div className="hidden md:flex sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative">
        <Header />

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-10 pb-28 md:pb-10 relative">
          {children}
        </main>

        {/* ── Mobile Nav Overlay ── */}
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] h-16 bg-[#0a0a1f]/90 backdrop-blur-xl border border-white/10 flex items-center justify-around px-4 z-50 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
          <MobileNavItem to="/" icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
          } />
          <MobileNavItem to="/polls" icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" /></svg>
          } />
          <div className="relative -top-5">
            <MobileNavItem to="/polls/create" isPrimary icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="16" /><line x1="8" x2="16" y1="12" y2="12" /></svg>
            } />
          </div>
          <MobileNavItem to="/analytics" icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
          } />
        </div>
      </div>
    </div>
  );
};

import { Link, useLocation } from 'react-router-dom';

const MobileNavItem = ({ to, icon, isPrimary }: { to: string, icon: React.ReactNode, isPrimary?: boolean }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to === '/polls' && location.pathname.startsWith('/poll/'));

  if (isPrimary) {
    return (
      <Link to={to} className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${isActive ? 'bg-gradient-to-tr from-purple-500 to-indigo-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]' : 'bg-gradient-to-tr from-indigo-500 to-blue-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]'}`}>
        {icon}
      </Link>
    );
  }

  return (
    <Link to={to} className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${isActive ? 'text-white bg-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]' : 'text-slate-500 hover:text-slate-300'}`}>
      {icon}
    </Link>
  );
};