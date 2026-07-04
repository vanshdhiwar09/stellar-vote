import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans text-slate-200 antialiased"
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

      <Sidebar />

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};