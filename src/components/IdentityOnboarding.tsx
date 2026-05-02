import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Fingerprint, ChevronRight, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function IdentityOnboarding({ userId, onComplete }: { userId: string, onComplete: (name: string) => void }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await setDoc(doc(db, 'profiles', userId), {
        name: name.trim(),
        createdAt: new Date()
      });
      onComplete(name.trim());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-6">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/10 blur-[150px] rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-cyan-600/10 blur-[150px] rounded-full -translate-x-1/3 translate-y-1/3" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative max-w-md w-full bg-zinc-900/50 border border-zinc-800 rounded-[3rem] p-12 backdrop-blur-3xl shadow-2xl"
      >
        <div className="w-20 h-20 bg-indigo-600/20 border border-indigo-500/30 rounded-3xl flex items-center justify-center text-indigo-400 mx-auto mb-10 shadow-[0_0_50px_rgba(79,70,229,0.1)]">
          <Fingerprint size={40} />
        </div>

        <div className="text-center space-y-4 mb-10">
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Initialize_ID</h2>
          <p className="text-zinc-500 text-sm font-medium leading-relaxed">Before accessing the secure protocol, you must establish your Project Identity. This label is permanent and non-transferable.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="relative">
            <Shield className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700" size={20} />
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ENTER_IDENTITY_LABEL"
              className="w-full bg-black border border-zinc-800 rounded-2xl pl-16 pr-6 py-6 text-sm font-black uppercase tracking-widest text-indigo-400 placeholder:text-zinc-800 focus:border-indigo-500 outline-none transition-all shadow-inner"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-30 shadow-xl flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Sync_ID <ChevronRight size={16} /></>}
          </button>
        </form>

        <div className="mt-12 flex items-center justify-center gap-2 text-[8px] font-mono text-zinc-700 uppercase tracking-[0.5em]">
          <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
          Encrypted_Connection_Active
        </div>
      </motion.div>
    </div>
  );
}
