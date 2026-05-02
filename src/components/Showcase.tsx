import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Layers, Globe, Shield, Cpu, ChevronRight, Activity, Terminal } from 'lucide-react';
import { Portfolio } from '../types';

export default function Showcase() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'portfolios'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setPortfolios(snap.docs.map(d => ({ id: d.id, ...d.data() } as Portfolio)));
      setLoading(false);
    }, (error) => {
      console.error("Showcase error", error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6">
        <div className="relative">
          <div className="w-20 h-20 border-t-2 border-indigo-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Terminal size={24} className="text-zinc-800 animate-pulse" />
          </div>
        </div>
        <p className="text-zinc-700 font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">Retrieving_Archives.sys</p>
      </div>
    );
  }

  return (
    <div className="space-y-32">
      <div className="relative">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-full h-[600px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="text-center max-w-3xl mx-auto space-y-8 relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em]"
          >
            <Activity size={14} className="animate-pulse" />
            SYNTHESIS_CHRONICLE_04
          </motion.div>
          <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase leading-none">
            Digital <br />
            <span className="text-indigo-500">Archives.</span>
          </h2>
          <p className="text-zinc-500 text-lg md:text-xl leading-relaxed font-medium max-w-2xl mx-auto italic">
            "Every shard of code tells a story of architectural evolution."
          </p>
        </div>
      </div>

      <div className="grid gap-40">
        {portfolios.map((item, idx) => (
          <PortfolioItem key={item.id} item={item} index={idx} />
        ))}
        {portfolios.length === 0 && (
          <div className="py-40 text-center border-t border-zinc-900">
             <p className="text-zinc-800 font-black uppercase tracking-[0.8em] text-xs">No_Archived_Protocols_Found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PortfolioItem({ item, index }: { item: Portfolio, index: number, key?: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="group relative"
    >
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 xl:gap-20 items-center">
        <div className={`space-y-10 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-[#070707] border border-zinc-900 rounded-[2rem] flex items-center justify-center text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:bg-indigo-600 transition-all duration-700">
              <span className="text-2xl font-black">{String(index + 1).padStart(2, '0')}</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.8]">{item.name}</h3>
              <div className="flex items-center gap-3">
                <div className="w-8 h-[1px] bg-indigo-500/50" />
                <span className="text-zinc-600 text-[10px] font-black tracking-[0.3em] uppercase">DEEP_ARCHIVE // TS_{item.createdAt?.toDate().getFullYear() || '2026'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-8 bg-zinc-950/20 border border-zinc-900/50 rounded-[2.5rem] backdrop-blur-3xl relative group-hover:border-indigo-500/20 transition-all duration-700 mx-1">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none -mr-4 -mt-4">
                <Terminal size={140} />
              </div>
              <h4 className="text-[9px] uppercase font-black text-indigo-500/50 tracking-[0.5em] mb-4 flex items-center gap-2">
                 <Activity size={10} /> TECHNICAL_SPECS
              </h4>
              <p className="text-zinc-400 text-base leading-relaxed font-medium whitespace-pre-wrap">{item.features}</p>
            </div>

            {item.adminNote && (
              <div className="px-8 py-6 border-l border-zinc-800 bg-black/20 rounded-r-3xl">
                 <p className="text-zinc-500 text-sm italic leading-relaxed font-mono opacity-60">" {item.adminNote} "</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-8 pt-4">
            <a 
              href={item.url} 
              target="_blank" 
              rel="noreferrer"
              className="w-full sm:w-auto px-12 py-5 bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95"
            >
              INITIALIZE_DEPLOYMENT <ChevronRight size={14} />
            </a>
            
            <div className="flex items-center gap-4 py-3 px-6 bg-zinc-950/50 border border-zinc-900 rounded-2xl">
               <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-[10px] font-black text-indigo-400">
                  {item.adminName.slice(0, 1)}
               </div>
               <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{item.adminName}</span>
            </div>
          </div>
        </div>

        <div className={`relative ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
           <div className="absolute -inset-10 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
           <div className="relative aspect-video rounded-[3rem] p-px bg-gradient-to-tr from-zinc-800 to-zinc-800/10 group-hover:from-indigo-500/50 group-hover:to-cyan-500/50 transition-all duration-1000">
             <div className="w-full h-full rounded-[3rem] overflow-hidden bg-[#050505]">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 scale-105 group-hover:scale-110 transition-all duration-[2000ms] ease-out opacity-40 group-hover:opacity-100" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-zinc-900 group-hover:text-indigo-500/20 transition-all duration-1000">
                     <Cpu size={100} className="stroke-[1px]" />
                     <span className="text-[9px] font-black uppercase tracking-[1em] translate-x-[0.5em]">DATALINK_OFFLINE</span>
                  </div>
                )}
             </div>
             
             {/* HUD Elements */}
             <div className="absolute top-8 right-8 z-20 flex gap-1.5">
               <div className="w-1 h-3 bg-white/10 group-hover:bg-indigo-500 transition-colors" />
               <div className="w-1 h-3 bg-white/10 group-hover:bg-indigo-500 transition-colors delay-75" />
               <div className="w-1 h-3 bg-white/10 group-hover:bg-indigo-500 transition-colors delay-150" />
             </div>
             <div className="absolute bottom-8 left-8 z-20">
               <div className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/5">
                 <p className="text-[7px] font-mono text-white/40 tracking-[0.3em] uppercase">VIRTUAL_ASSET_v02</p>
               </div>
             </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
