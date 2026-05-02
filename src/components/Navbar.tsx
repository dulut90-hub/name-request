import React, { useState, useEffect } from 'react';
import { Terminal, LayoutDashboard, History, ShieldCheck, LogOut, Plus, Search, MessageCircle, Cpu, Wrench } from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface NavbarProps {
  onLogout: () => void;
  currentView: string;
  setView: (v: any) => void;
  isAdmin: boolean;
}

export default function Navbar({ onLogout, currentView, setView, isAdmin }: NavbarProps) {
  const [whatsappUrl, setWhatsappUrl] = useState('');

  useEffect(() => {
    return onSnapshot(doc(db, 'config', 'global'), (snap) => {
      if (snap.exists()) setWhatsappUrl(snap.data().whatsappUrl || '');
    });
  }, []);
  return (
    <nav className="z-50">
      {/* Top Bar - Branding & Secondary Actions */}
      <div className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-zinc-900/40">
        <div className="max-w-6xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setView('home')}
          >
            <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] group-hover:scale-105 transition-all">
              <Terminal size={18} className="md:w-[22px] md:h-[22px]" />
            </div>
            <div>
              <h1 className="text-sm md:text-lg font-black text-white tracking-widest uppercase">Name-Request</h1>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[7px] md:text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-mono">Status: Connected</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            <NavLink active={currentView === 'home'} onClick={() => setView('home')} label="Protocol" />
            <NavLink active={currentView === 'showcase'} onClick={() => setView('showcase')} label="Archives" />
            <NavLink active={currentView === 'tools'} onClick={() => setView('tools')} label="System" />
            <NavLink active={currentView === 'history'} onClick={() => setView('history')} label="Status_Vault" />
            <NavLink active={currentView === 'admin'} onClick={() => setView('admin')} label="Vanguard" />
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <a 
              href={whatsappUrl || 'https://whatsapp.com/channel/0029Vb8cslf8aKvEpFOaMC0m'}
              target="_blank"
              rel="noreferrer"
              className="p-2 md:p-2.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white transition-all shadow-[0_0_15px_rgba(34,197,94,0.1)]"
              title="System Channel"
            >
              <MessageCircle size={16} className="md:w-[18px] md:h-[18px]" />
            </a>
            
            {isAdmin && (
              <button 
                onClick={onLogout}
                className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-red-500/10 text-red-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
              >
                <LogOut size={12} className="inline mr-1 md:mr-2 md:w-[14px] md:h-[14px]" />
                <span className="hidden sm:inline">Terminate</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Floating Bottom Nav - Primary Navigation */}
      <div className="lg:hidden fixed bottom-4 inset-x-4 z-[60] safe-area-bottom">
        <div className="bg-[#050505]/90 backdrop-blur-3xl border border-zinc-800/80 rounded-[2rem] p-2 flex items-center justify-around shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <MobileNavItem active={currentView === 'home'} onClick={() => setView('home')} icon={<Terminal size={20} />} label="Sync" />
          <MobileNavItem active={currentView === 'showcase'} onClick={() => setView('showcase')} icon={<LayoutDashboard size={20} />} label="Archives" />
          <MobileNavItem active={currentView === 'tools'} onClick={() => setView('tools')} icon={<Cpu size={20} />} label="System" />
          <MobileNavItem active={currentView === 'history'} onClick={() => setView('history')} icon={<History size={20} />} label="Vault" />
          <MobileNavItem active={currentView === 'admin'} onClick={() => setView('admin')} icon={<ShieldCheck size={20} />} label="Vanguard" />
        </div>
      </div>
    </nav>
  );
}

function MobileNavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl transition-all active:scale-90
        ${active ? 'text-indigo-400 bg-indigo-500/10' : 'text-zinc-600'}`}
    >
      <div className={`${active ? 'scale-110' : 'scale-100'} transition-transform`}>
        {icon}
      </div>
      <span className="text-[8px] font-black uppercase tracking-[0.2em]">{label}</span>
    </button>
  );
}

function NavLink({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all relative py-2
        ${active ? 'text-indigo-400' : 'text-zinc-600 hover:text-zinc-300'}`}
    >
      {label}
      {active && (
        <motion.div 
          layoutId="navUnderline"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full"
        />
      )}
    </button>
  );
}
