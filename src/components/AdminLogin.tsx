import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Fingerprint, Lock, User as UserIcon, Eye, EyeOff, AlertTriangle } from 'lucide-react';

interface AdminLoginProps {
  onAuthenticated: () => void;
}

export default function AdminLogin({ onAuthenticated }: AdminLoginProps) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [identity, setIdentity] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      name === 'admin@123' && 
      password === 'awkioawrhuiawurawurahwr' && 
      identity === 'korupsi'
    ) {
      onAuthenticated();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,1)]" />
        
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-cyan-500 mb-6 group transition-all hover:bg-cyan-500 hover:text-black">
            <Fingerprint size={32} className="group-hover:scale-110 transition-transform" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Access Control</h2>
          <p className="text-zinc-500 font-mono text-[10px] mt-2 tracking-[0.2em]">RESTRICTED_PROTOCOL_ACTIVE</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="relative group">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-cyan-500 transition-colors" size={18} />
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Access Name"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-cyan-500 focus:outline-none transition-all placeholder:text-zinc-700 font-mono text-sm"
                required
              />
            </div>
          </div>

          <div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-cyan-500 transition-colors" size={18} />
              <input 
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Encrypted Key"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-12 py-4 text-white focus:border-cyan-500 focus:outline-none transition-all placeholder:text-zinc-700 font-mono text-sm"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <div className="relative group">
              <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-cyan-500 transition-colors" size={18} />
              <input 
                type="text"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                placeholder="Identity Token"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-cyan-500 focus:outline-none transition-all placeholder:text-zinc-700 font-mono text-sm"
                required
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                <AlertTriangle size={14} />
                Access Denied: Invalid Credentials
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            className="w-full bg-white text-black font-black uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-cyan-500 transition-all active:scale-95 shadow-xl"
          >
            Authenticate
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-zinc-700 font-mono italic">Notice: All failed login attempts are logged by the system.</p>
        </div>
      </motion.div>
    </div>
  );
}
