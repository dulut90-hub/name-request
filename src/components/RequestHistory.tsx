import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Clock4,
  Image as ImageIcon,
  Key,
  ShieldCheck,
  Send,
  Loader2,
  Info
} from 'lucide-react';
import { SourceRequest } from '../types';

interface RequestHistoryProps {
  user: any;
}

export default function RequestHistory({ user }: RequestHistoryProps) {
  const [requests, setRequests] = useState<SourceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'requests'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as SourceRequest)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'requests');
    });
    return () => unsub();
  }, [user]);

  const findByKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKey.trim()) return;
    setSearching(true);
    setError('');
    try {
      const q = query(collection(db, 'requests'), where('secretKey', '==', searchKey.trim().toUpperCase()));
      const snap = await getDocs(q);
      if (snap.empty) {
        setError('CRITICAL: Access code not recognized. Check credentials.');
      } else {
        const found = snap.docs.map(d => ({ id: d.id, ...d.data() } as SourceRequest));
        setRequests(found);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-zinc-900">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500/70">Secure_Vault // Tracking_Enabled</span>
          </div>
          <h2 className="text-5xl font-black text-white tracking-tighter uppercase">Status_Vault</h2>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-zinc-500 text-sm font-medium italic">Monitoring production pipeline status.</p>
            <div className="px-3 py-1 bg-zinc-950 border border-zinc-900 rounded-lg text-[9px] font-black font-mono text-zinc-600 uppercase tracking-widest">
              Total_Packets: {requests.length.toString().padStart(3, '0')}
            </div>
          </div>
        </div>

        <form onSubmit={findByKey} className="w-full md:w-80">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
            <input 
              type="text"
              placeholder="ACCESS_KEY_INJECTION"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl pl-12 pr-4 py-4 text-xs font-mono text-indigo-400 placeholder:text-zinc-800 focus:border-indigo-500 outline-none transition-all uppercase tracking-widest"
            />
            {searching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin" size={16} />}
          </div>
          {error && <p className="text-[9px] text-red-500 mt-2 font-bold uppercase tracking-wider">{error}</p>}
        </form>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-zinc-700 font-mono text-[9px] uppercase tracking-widest">Hydrating_Secure_Context...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-zinc-900/20 border border-zinc-900 p-20 rounded-[3rem] text-center">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6 text-zinc-700">
            <History size={32} />
          </div>
          <h3 className="text-xl font-bold text-white uppercase tracking-tight">No Active Packets</h3>
          <p className="text-zinc-600 mt-2 text-sm max-w-xs mx-auto">Your identity has no recorded source code requests. Use the Initialize protocol to start.</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {requests.map(req => (
            <RequestCard key={req.id} request={req} />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestCard({ request }: { request: SourceRequest, key?: any }) {

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/40 border border-zinc-900 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group hover:bg-zinc-900/60 transition-all"
    >
      <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
        <ShieldCheck size={120} />
      </div>

      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <StatusIcon status={request.status} />
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">{request.name}</h3>
              <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest mt-1">Packet_CID: {request.id.toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-black border border-zinc-800 rounded-xl font-mono text-xs text-indigo-400 tracking-widest font-bold">
               {request.secretKey}
             </div>
             <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Identity_Key</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-10">
          <div className="space-y-6">
            <div className="p-6 bg-zinc-950/80 border border-zinc-900 rounded-3xl">
              <h4 className="text-[10px] uppercase font-black text-zinc-700 tracking-[0.3em] mb-4 flex items-center gap-2 italic">
                <Info size={12} /> Blueprint_Data
              </h4>
              <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap font-medium">{request.webType}</p>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-700">
                <Clock4 size={14} /> Created: {request.createdAt?.toDate().toLocaleDateString()}
              </div>
              {request.imageUrl && (
                <a 
                  href={request.imageUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 p-2 px-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-lg"
                >
                  <ImageIcon size={14} /> View_Engineering_Blueprint
                </a>
              )}
            </div>
          </div>

          <div className="space-y-4">
             <div className="p-5 bg-zinc-950/50 rounded-2xl border border-zinc-900 italic">
               <p className="text-[10px] text-zinc-700 font-mono leading-relaxed">
                 NODE_IP: VIRTUAL_0.1 <br />
                 LATENCY: 0.12ms <br />
                 STATUS: {request.status.toUpperCase()}
               </p>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
