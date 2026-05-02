import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Code2, Cpu, Globe, Shield, Sparkles, MessageCircle, ChevronRight } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Hero({ onAction }: { onAction: () => void }) {
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [whatsappGroupUrl, setWhatsappGroupUrl] = useState('');

  useEffect(() => {
    return onSnapshot(doc(db, 'config', 'global'), (snap) => {
      if (snap.exists()) {
        setWhatsappUrl(snap.data().whatsappUrl || '');
        setWhatsappGroupUrl(snap.data().whatsappGroupUrl || '');
      }
    });
  }, []);
  return (
    <div className="relative pt-12 pb-24 overflow-hidden">
      <div className="grid lg:grid-cols-[1fr_0.8fr] gap-16 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-2">
              <Sparkles size={12} className="text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Next-Gen Architecture Available</span>
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl md:text-9xl font-black text-white leading-[0.8] tracking-tighter"
          >
            SYNTHESIZE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 animate-gradient drop-shadow-[0_0_30px_rgba(79,70,229,0.3)]">
              EXCELLENCE.
            </span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex items-center gap-6 mt-12 py-4 border-y border-zinc-900/50"
          >
            {[
              { val: "0.12ms", label: "LATENCY" },
              { val: "99.9%", label: "UPTIME" },
              { val: "256bit", label: "AES-ENC" }
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-[10px] font-mono text-zinc-600 mb-1 tracking-widest">{stat.label}</p>
                <p className="text-xs font-black text-white tracking-widest">{stat.val}</p>
              </div>
            ))}
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-10 text-zinc-500 text-lg leading-relaxed max-w-lg font-medium"
          >
            Submit your technical blueprint. Our engineering core will process your vision into production-grade source code. Zero friction. Total security.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12 flex flex-wrap gap-4"
          >
            <button 
              onClick={onAction}
              className="px-10 py-5 bg-white text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-500 hover:text-white transition-all shadow-[0_20px_40px_rgba(255,255,255,0.05)] active:scale-95 flex items-center gap-2"
            >
              Start_Sequence <ChevronRight size={18} />
            </button>
            {whatsappUrl && (
              <a 
                href={whatsappUrl || 'https://whatsapp.com/channel/0029Vb8cslf8aKvEpFOaMC0m'}
                target="_blank"
                rel="noreferrer"
                className="px-8 py-5 bg-green-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 flex items-center gap-3 animate-pulse group whitespace-nowrap text-[10px] md:text-xs"
              >
                <MessageCircle size={20} className="group-hover:rotate-12 transition-transform" /> Main_Channel
              </a>
            )}
            {whatsappGroupUrl && (
              <a 
                href={whatsappGroupUrl}
                target="_blank"
                rel="noreferrer"
                className="px-8 py-5 bg-zinc-900 text-zinc-400 font-black uppercase tracking-[0.2em] rounded-2xl border border-zinc-800 hover:text-white transition-all flex items-center gap-3 group whitespace-nowrap text-[10px] md:text-xs"
              >
                <MessageCircle size={20} className="text-green-500 group-hover:scale-110 transition-transform" /> Support_Core
              </a>
            )}
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          className="relative hidden lg:block"
        >
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-indigo-500/20 to-transparent blur-3xl opacity-30" />
          <div className="p-1 bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-[3rem] shadow-2xl overflow-hidden">
            <div className="bg-[#050505] rounded-[2.8rem] p-10 font-mono text-sm">
              <div className="flex items-center gap-2 mb-10">
                <div className="w-3 h-3 rounded-full bg-zinc-800" />
                <div className="w-3 h-3 rounded-full bg-zinc-800" />
                <div className="w-3 h-3 rounded-full bg-zinc-800" />
                <span className="ml-2 text-[10px] text-zinc-700 uppercase tracking-widest">Process_Monitor_v2</span>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-zinc-600 mb-1">&gt; initialize_secure_handshake()</p>
                  <p className="text-indigo-400 font-bold">ENC_RSA_4096: OK</p>
                </div>
                <div>
                  <p className="text-zinc-600 mb-1">&gt; scan_resource_availability()</p>
                  <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "84%" }}
                      className="h-full bg-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  {[Code2, Shield, Globe].map((Icon, i) => (
                    <div key={i} className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                      <Icon size={20} className="text-zinc-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
