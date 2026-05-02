import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Send, AlertTriangle, Loader2, Key, Copy, Check, ShieldCheck, Upload, Image as ImageIcon, X } from 'lucide-react';

interface RequestFormProps {
  user: any;
  profile: any;
  onComplete: () => void;
  onCancel: () => void;
}

export default function RequestForm({ user, profile, onComplete, onCancel }: RequestFormProps) {
  const [name, setName] = useState(profile?.name || '');
  const [webType, setWebType] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestCount, setRequestCount] = useState<number | null>(null);
  const [checking, setChecking] = useState(true);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const checkLimit = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'requests'), where('userId', '==', user.uid), where('status', '==', 'pending'));
        const snapshot = await getDocs(q);
        setRequestCount(snapshot.size);
      } catch (error) {
        console.error(error);
      } finally {
        setChecking(false);
      }
    };
    checkLimit();
  }, [user]);

  const generateSecret = () => {
    return Math.random().toString(36).substring(2, 12).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !webType || !user) return;
    if (requestCount !== null && requestCount >= 3) return;

    setLoading(true);
    const secret = generateSecret();
    try {
      await addDoc(collection(db, 'requests'), {
        name,
        webType,
        imageUrl: '', // Initialize empty as admin will capture it later
        status: 'pending',
        secretKey: secret,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      setGeneratedKey(secret);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'requests');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6">
        <div className="w-12 h-12 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-[0.3em]">Synching_Identity_Node...</p>
      </div>
    );
  }

  if (generatedKey) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto"
      >
        <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[2.5rem] text-center">
          <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-green-500/20">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 uppercase">Protocol Initiated</h2>
          <p className="text-zinc-500 leading-relaxed mb-10">
            Your source code request has been encrypted. You MUST save the following access key to track your progress and communicate with admins.
          </p>

          <div className="relative group">
            <div className="bg-black border border-zinc-800 rounded-2xl p-6 font-mono text-2xl font-bold text-indigo-400 tracking-[0.5em] flex items-center justify-center">
              {generatedKey}
            </div>
            <button 
              onClick={copyToClipboard}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-all shadow-xl"
            >
              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
            </button>
          </div>

          <button 
            onClick={onComplete}
            className="mt-12 w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-500 hover:text-white transition-all shadow-2xl"
          >
            Access Request Dashboard
          </button>
        </div>
      </motion.div>
    );
  }

  const isAtLimit = requestCount !== null && requestCount >= 3;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-zinc-900/40 border border-zinc-900 p-10 rounded-[3rem] backdrop-blur-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
          <Key className="text-zinc-800 rotate-12" size={80} />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-8 border-b border-zinc-900">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-none truncate">{profile?.name || 'INITIALIZING...'}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 italic">SECURE_SYNC: CONNECTED</span>
                </div>
              </div>
            </div>
            {isAtLimit && (
              <div className="flex items-center gap-3 px-4 py-2 bg-red-500/5 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest self-start md:self-center">
                <AlertTriangle size={14} />
                QUOTA_FULL
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-black mb-4 flex items-center justify-between">
                Project Identity / Label
                <span className="text-indigo-400 font-mono text-[8px] italic">PERMANENT_RECORD_LINKED_TO_PROFILE</span>
              </label>
              <input 
                type="text"
                value={name}
                readOnly
                className="w-full bg-zinc-950/80 border border-indigo-500/20 rounded-2xl px-6 py-5 text-indigo-400 focus:outline-none transition-all placeholder:text-zinc-800 font-black uppercase tracking-widest cursor-not-allowed"
                placeholder="UNIDENTIFIED_NODE"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-black mb-4">Functional Specifications</label>
              <textarea 
                value={webType}
                onChange={(e) => setWebType(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 py-5 text-zinc-200 focus:border-indigo-500 focus:outline-none transition-all min-h-[220px] placeholder:text-zinc-800 font-medium leading-relaxed"
                placeholder="Describe layouts, tech stack preferences, and integration points..."
                required
              />
            </div>

            <div className="flex items-center gap-4 pt-6">
              {!isAtLimit ? (
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-white text-black font-black uppercase tracking-[0.2em] py-5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-indigo-500 hover:text-white active:scale-95 disabled:opacity-50 shadow-2xl"
                >
                  {loading ? <Loader2 className="animate-spin text-black" /> : <Send size={20} />}
                  Encrypt & Submit
                </button>
              ) : (
                <div className="flex-1 py-5 bg-zinc-950 border border-zinc-900 rounded-2xl text-center text-zinc-600 font-bold uppercase tracking-widest text-xs italic">
                  Max Quota Reached (3/3)
                </div>
              )}
              <button 
                type="button"
                onClick={onCancel}
                className="px-10 py-5 bg-zinc-900 border border-zinc-800 text-zinc-500 font-black uppercase tracking-[0.2em] rounded-2xl hover:text-white transition-all shadow-xl"
              >
                Abort Log
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
