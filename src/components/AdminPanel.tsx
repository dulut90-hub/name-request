import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, addDoc, serverTimestamp, deleteDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';
import { 
  Briefcase, 
  Search, 
  ExternalLink, 
  CheckCircle, 
  XSquare, 
  Megaphone, 
  Plus, 
  Trash2, 
  Clock, 
  User as UserIcon,
  MessageCircle,
  Hash,
  Upload,
  Image as ImageIcon,
  Send,
  MoreHorizontal,
  ChevronRight,
  ShieldCheck,
  Activity,
  Key,
  Layers,
  Wrench,
  Camera
} from 'lucide-react';
import { SourceRequest, Announcement, RequestStatus, ChatMessage, Portfolio } from '../types';

import Modal from './Modal';

export default function AdminPanel() {
  const [requests, setRequests] = useState<SourceRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activeTab, setActiveTab] = useState<'requests' | 'announcements' | 'portfolios'>('requests');
  const [requestSubTab, setRequestSubTab] = useState<'pending' | 'history'>('pending');
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState<string | null>(null);
  const [newAnnounce, setNewAnnounce] = useState('');
  const [newAnnounceImg, setNewAnnounceImg] = useState('');
  const [search, setSearch] = useState('');

  // Modals state
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; description: string; onConfirm: () => void; icon?: React.ReactNode } | null>(null);
  const [whatsappGroupUrl, setWhatsappGroupUrl] = useState('');
  const [whatsappModal, setWhatsappModal] = useState(false);
  const [tempWhatsappUrl, setTempWhatsappUrl] = useState('');
  const [tempWhatsappGroupUrl, setTempWhatsappGroupUrl] = useState('');

  // Portfolio Form State
  const [pName, setPName] = useState('');
  const [pUrl, setPUrl] = useState('');
  const [pFeatures, setPFeatures] = useState('');
  const [pNote, setPNote] = useState('');
  const [pAdminName, setPAdminName] = useState('Vanguard Prime');
  const [pImg, setPImg] = useState('');
  const [isSubmittingP, setIsSubmittingP] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const pFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onSnapshot(doc(db, 'config', 'global'), (snap) => {
      if (snap.exists()) {
        const url = snap.data().whatsappUrl || '';
        const groupUrl = snap.data().whatsappGroupUrl || '';
        setWhatsappUrl(url);
        setWhatsappGroupUrl(groupUrl);
        setTempWhatsappUrl(url);
        setTempWhatsappGroupUrl(groupUrl);
      }
    });
  }, []);

  const updateWhatsapp = async () => {
    await setDoc(doc(db, 'config', 'global'), { 
      whatsappUrl: tempWhatsappUrl,
      whatsappGroupUrl: tempWhatsappGroupUrl 
    });
    setWhatsappModal(false);
  };

  useEffect(() => {
    const qReq = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
    const unsubReq = onSnapshot(qReq, (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as SourceRequest)));
      setLoading(false);
    });

    const qAnn = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsubAnn = onSnapshot(qAnn, (snap) => {
      setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement)));
    });

    const qPort = query(collection(db, 'portfolios'), orderBy('createdAt', 'desc'));
    const unsubPort = onSnapshot(qPort, (snap) => {
      setPortfolios(snap.docs.map(d => ({ id: d.id, ...d.data() } as Portfolio)));
    });

    return () => {
      unsubReq();
      unsubAnn();
      unsubPort();
    };
  }, []);

  const captureCard = async (id: string) => {
    const element = document.getElementById(`request-capture-${id}`);
    if (!element) return null;

    setCapturing(id);
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#050505',
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      return new Promise<string>((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            reject('Blob creation failed');
            return;
          }
          const storageRef = ref(storage, `captures/${id}-${Date.now()}.png`);
          await uploadBytes(storageRef, blob);
          const url = await getDownloadURL(storageRef);
          resolve(url);
        }, 'image/png');
      });
    } catch (error) {
      console.error('Capture failed:', error);
      return null;
    } finally {
      setCapturing(null);
    }
  };

  const handleUpdateStatus = async (id: string, status: RequestStatus) => {
    const actionLabel = status === 'accepted' ? 'AUTHORIZE' : 'REJECT';
    
    setConfirmModal({
      isOpen: true,
      title: `${actionLabel} Protocol`,
      description: `Targeting Packet [${id.slice(0, 8)}]. System will automatically capture a visual record and transition state to ${status.toUpperCase()}. Proceed?`,
      icon: status === 'accepted' ? <CheckCircle className="text-green-500" /> : <XSquare className="text-red-500" />,
      onConfirm: async () => {
        setConfirmModal(null);
        
        // 1. Capture the element
        const capturedImageUrl = await captureCard(id);
        
        // 2. Update status and image
        try {
          const updateData: any = { status };
          if (capturedImageUrl) {
            updateData.imageUrl = capturedImageUrl;
          }
          await updateDoc(doc(db, 'requests', id), updateData);
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `requests/${id}`);
        }
      }
    });
  };

  const deleteRequest = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "DESTRUCT_PACKET",
      description: "Are you sure you want to permanently delete this request history? This action cannot be reversed.",
      icon: <Trash2 className="text-red-600" />,
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'requests', id));
          setConfirmModal(null);
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `requests/${id}`);
        }
      }
    });
  };

  const createAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnounce) return;
    try {
      await addDoc(collection(db, 'announcements'), {
        content: newAnnounce,
        imageUrl: newAnnounceImg,
        createdAt: serverTimestamp()
      });
      setNewAnnounce('');
      setNewAnnounceImg('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'announcements');
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `announcements/${id}`);
    }
  };

  const handleCreatePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pUrl) return;
    setIsSubmittingP(true);
    try {
      await addDoc(collection(db, 'portfolios'), {
        name: pName,
        url: pUrl,
        features: pFeatures,
        adminNote: pNote,
        adminName: pAdminName,
        imageUrl: pImg,
        createdAt: serverTimestamp()
      });
      setPName('');
      setPUrl('');
      setPFeatures('');
      setPNote('');
      setPImg('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'portfolios');
    } finally {
      setIsSubmittingP(false);
    }
  };

  const deletePortfolio = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'portfolios', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `portfolios/${id}`);
    }
  };

  const handlePortfolioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsSubmittingP(true);
    try {
      const storageRef = ref(storage, `archives/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setPImg(url);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingP(false);
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    const matchesTab = requestSubTab === 'pending' ? r.status === 'pending' : r.status !== 'pending';
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 pb-8 border-b border-zinc-900">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500/70">Secure_Admin_Mode // High_Priority</span>
          </div>
          <h2 className="text-5xl font-black text-white tracking-tighter">VANGUARD_HUD</h2>
          <p className="text-zinc-500 text-sm mt-2 font-medium">Managing encrypted source code acquisition protocols.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800/50 shrink-0">
            <TabButton active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} label="Operations" count={requests.length} />
            <TabButton active={activeTab === 'announcements'} onClick={() => setActiveTab('announcements')} label="Broadcasts" count={announcements.length} />
            <TabButton active={activeTab === 'portfolios'} onClick={() => setActiveTab('portfolios')} label="Archives" count={portfolios.length} />
          </div>
          <button 
            onClick={() => setWhatsappModal(true)}
            className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-green-500 hover:bg-green-500 hover:text-white transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest"
          >
            <MessageCircle size={16} /> Config_WA
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'requests' ? (
          <motion.div 
            key="reqs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between gap-6">
              <div className="flex bg-zinc-950/50 p-1 rounded-xl border border-zinc-900">
                <button 
                  onClick={() => setRequestSubTab('pending')}
                  className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${requestSubTab === 'pending' ? 'bg-indigo-600 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
                >
                  Active_Packets
                </button>
                <button 
                  onClick={() => setRequestSubTab('history')}
                  className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${requestSubTab === 'history' ? 'bg-indigo-600 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
                >
                  Log_Archive
                </button>
              </div>

              <div className="relative group flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                <input 
                  type="text"
                  placeholder="FILTER_BY_HASH"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl pl-12 pr-6 py-4 text-white focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-800 font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid gap-10">
              {filteredRequests.map((req, idx) => (
                <AdminRequestCard 
                  key={req.id} 
                  request={req} 
                  isCapturing={capturing === req.id}
                  onStatus={handleUpdateStatus} 
                  onDelete={() => deleteRequest(req.id)}
                  index={idx} 
                />
              ))}
              {filteredRequests.length === 0 && (
                <div className="py-20 text-center text-zinc-800 font-mono text-[10px] uppercase tracking-[0.5em]">No_Matching_Packets_Detected</div>
              )}
            </div>
          </motion.div>
        ) : activeTab === 'announcements' ? (
          <motion.div 
            key="annc"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-10"
          >
            <form onSubmit={createAnnouncement} className="bg-zinc-900/20 border border-zinc-800 p-8 rounded-[2.5rem]">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <Megaphone size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight">System Broadcast</h3>
                  <p className="text-zinc-600 text-[10px] font-mono tracking-widest uppercase">Global_Notification_Chain</p>
                </div>
              </div>
              <div className="grid md:grid-cols-[1fr_auto] gap-6 items-end">
                <div className="space-y-4">
                  <input 
                    type="text"
                    value={newAnnounce}
                    onChange={(e) => setNewAnnounce(e.target.value)}
                    placeholder="Input message for broad distribution..."
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-4 text-white focus:border-indigo-500 outline-none font-medium"
                  />
                  <input 
                    type="text"
                    value={newAnnounceImg}
                    onChange={(e) => setNewAnnounceImg(e.target.value)}
                    placeholder="Image Blueprint URL (Optional)"
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-4 text-white focus:border-indigo-500 outline-none text-xs font-mono"
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-indigo-600 text-white px-10 py-4 h-[60px] rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  Publish
                </button>
              </div>
            </form>

            <div className="grid gap-4">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-6 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-between group hover:border-zinc-700 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <Hash size={20} />
                    </div>
                    <div>
                      <p className="text-zinc-200 font-bold">{ann.content}</p>
                      <p className="text-[9px] text-zinc-600 uppercase font-mono mt-1 tracking-widest">TS: {ann.createdAt?.toDate().toLocaleTimeString() || 'Instant'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteAnnouncement(ann.id)}
                    className="p-3 text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="portfolios"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-12"
          >
            <div className="bg-zinc-900/20 border border-zinc-800 p-10 rounded-[3rem]">
              <div className="flex items-center gap-4 mb-10">
                <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Archive New Synthesis</h3>
                  <p className="text-zinc-600 text-[10px] font-mono tracking-widest uppercase">Portfolio_Entry_Module</p>
                </div>
              </div>

              <form onSubmit={handleCreatePortfolio} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormInput label="Web Identity" value={pName} onChange={setPName} placeholder="e.g. NEON-DASHBOARD-V1" />
                <FormInput label="Deployment URL" value={pUrl} onChange={setPUrl} placeholder="https://..." />
                <div className="md:col-span-2">
                  <FormTextarea label="Integrated Features" value={pFeatures} onChange={setPFeatures} placeholder="List core functionalities..." />
                </div>
                <FormInput label="Admin Log" value={pNote} onChange={setPNote} placeholder="Internal observations..." />
                <FormInput label="Technician Identity" value={pAdminName} onChange={setPAdminName} placeholder="Lead Engineer name" />
                
                <div className="md:col-span-2">
                   <label className="block text-[10px] uppercase tracking-[0.3em] font-black text-zinc-700 mb-3">Snapshot Payload (Device Upload)</label>
                   <div className="flex gap-4">
                     <button 
                        type="button"
                        onClick={() => pFileInputRef.current?.click()}
                        className="flex-1 px-6 py-4 bg-zinc-950 border border-indigo-500/20 border-dashed rounded-2xl text-zinc-500 text-xs font-black uppercase tracking-widest hover:border-indigo-500 hover:text-white transition-all h-[60px] flex items-center justify-center gap-3"
                     >
                       <Upload size={16} /> {pImg ? "REPLACE_PAYLOAD" : "UPLOAD_ARCHIVE_IMAGE"}
                     </button>
                     <input type="file" hidden ref={pFileInputRef} onChange={handlePortfolioFileUpload} accept="image/*" />
                     {pImg && (
                       <div className="w-16 h-[60px] rounded-xl overflow-hidden border border-zinc-800">
                         <img src={pImg} className="w-full h-full object-cover" alt="preview" />
                       </div>
                     )}
                   </div>
                </div>
                <div className="md:col-span-2 pt-4">
                  <button 
                    type="submit"
                    disabled={isSubmittingP}
                    className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isSubmittingP ? <Loader2 className="w-5 h-5" /> : <Plus size={20} />}
                    Commit Archive
                  </button>
                </div>
              </form>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {portfolios.map(p => (
                <div key={p.id} className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 flex flex-col gap-6 group hover:border-indigo-500/30 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-black text-white uppercase tracking-tight">{p.name}</h4>
                      <p className="text-indigo-400 text-[10px] font-mono mt-1">{p.url}</p>
                    </div>
                    <button 
                      onClick={() => deletePortfolio(p.id)}
                      className="p-3 bg-zinc-900 rounded-xl text-zinc-600 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="p-5 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                    <p className="text-zinc-500 text-xs leading-relaxed line-clamp-3">{p.features}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-900">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{p.adminName}</span>
                    </div>
                    <span className="text-[8px] font-mono uppercase text-zinc-800">{p.createdAt?.toDate().toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal 
        isOpen={!!confirmModal?.isOpen} 
        onClose={() => setConfirmModal(null)} 
        title={confirmModal?.title || 'Confirm Action'}
        description={confirmModal?.description}
        icon={confirmModal?.icon}
      >
        <div className="flex gap-4">
          <button 
            onClick={() => setConfirmModal(null)}
            className="flex-1 py-4 bg-zinc-800 text-zinc-400 font-black uppercase tracking-widest rounded-2xl text-[10px] hover:text-white transition-all"
          >
            Abort_Action
          </button>
          <button 
            onClick={confirmModal?.onConfirm}
            className="flex-1 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl text-[10px] hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
          >
            Authorize_Protocol
          </button>
        </div>
      </Modal>

      <Modal 
        isOpen={whatsappModal} 
        onClose={() => setWhatsappModal(false)}
        title="Command Channel Configuration"
        description="Synchronize communication links for global reporting."
        icon={<MessageCircle className="text-green-500" />}
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] uppercase font-black text-zinc-600 tracking-widest">Main Channel (Broadcast)</label>
            <input 
              type="text"
              value={tempWhatsappUrl}
              onChange={(e) => setTempWhatsappUrl(e.target.value)}
              placeholder="https://whatsapp.com/channel/..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:border-green-500 outline-none text-sm font-medium transition-all"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] uppercase font-black text-zinc-600 tracking-widest">Support Group (Communication)</label>
            <input 
              type="text"
              value={tempWhatsappGroupUrl}
              onChange={(e) => setTempWhatsappGroupUrl(e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:border-green-500 outline-none text-sm font-medium transition-all"
            />
          </div>
          <button 
            onClick={updateWhatsapp}
            className="w-full py-5 bg-green-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-green-500 transition-all text-[10px] shadow-lg shadow-green-500/20"
          >
            UPDATE_COMMAND_NODES
          </button>
        </div>
      </Modal>
    </div>
  );
}

function TabButton({ active, onClick, label, count }: { active: boolean, onClick: () => void, label: string, count: number }) {
  return (
    <button 
      onClick={onClick}
      className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-3
        ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 px-10' : 'text-zinc-600 hover:text-zinc-400'}`}
    >
      {label}
      <span className={`px-2 py-0.5 rounded-full text-[9px] border ${active ? 'bg-white/20 border-white/20 text-white' : 'bg-transparent border-zinc-800 text-zinc-700'}`}>
        {count}
      </span>
    </button>
  );
}

function AdminRequestCard({ request, onStatus, onDelete, index, isCapturing }: { request: SourceRequest, onStatus: (id: string, s: RequestStatus) => void, onDelete: () => void, index: number, isCapturing?: boolean, key?: any }) {
  const [showChat, setShowChat] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative"
    >
      <div 
        id={`request-capture-${request.id}`}
        className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] overflow-hidden group hover:border-indigo-500/30 transition-all shadow-2xl"
      >
        <div className="p-8 md:p-12 relative overflow-hidden">
          {/* Decorative Background Elements for the Capture */}
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
            <ShieldCheck size={180} />
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start gap-10 relative z-10">
            <div className="flex-1 space-y-8">
              <div className="flex flex-wrap items-center gap-5">
                <StatusBadge status={request.status} />
                <h3 className="text-3xl font-black text-white uppercase tracking-tight">{request.name}</h3>
                <div className="px-4 py-1.5 bg-black border border-zinc-900 rounded-xl text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Hash size={12} /> {request.id.slice(0, 16).toUpperCase()}
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-8 bg-black/40 border border-zinc-800 rounded-3xl backdrop-blur-md">
                  <h4 className="text-[10px] uppercase font-black text-zinc-600 tracking-[0.4em] mb-6 flex items-center gap-3">
                    <Activity size={14} className="text-zinc-700" /> Blueprint_Specifications
                  </h4>
                  <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap font-medium">{request.webType}</p>
                </div>

                <div className="flex flex-wrap items-center gap-8 text-[9px] uppercase font-black tracking-[0.2em] text-zinc-600 pt-2 px-2">
                   <span className="flex items-center gap-3"><Clock size={16} className="text-zinc-800" /> SYNC_TX: {request.createdAt?.toDate().toLocaleString()}</span>
                   <span className="flex items-center gap-3 text-indigo-500/50"><Key size={16} /> RSA_CIPHER: {request.secretKey}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full lg:w-[280px] shrink-0" data-html2canvas-ignore>
              <div className="p-2 bg-black border border-zinc-900 rounded-2xl grid grid-cols-2 gap-2">
                <StatusAction active={request.status === 'accepted'} onClick={() => onStatus(request.id, 'accepted')} icon={<CheckCircle size={20} />} label="Authorize" color="text-green-500" />
                <StatusAction active={request.status === 'rejected'} onClick={() => onStatus(request.id, 'rejected')} icon={<XSquare size={20} />} label="Reject" color="text-red-500" />
              </div>

              <button 
                onClick={() => setShowChat(!showChat)}
                className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg
                  ${showChat ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-black border border-zinc-900 text-zinc-500 hover:text-white'}`}
              >
                <MessageCircle size={18} /> Secure_Comm_Log
              </button>

              <button 
                onClick={onDelete}
                className="w-full py-5 bg-black border border-zinc-900 text-red-500/40 hover:text-red-500 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all font-mono"
              >
                <Trash2 size={18} /> PURGE_RECORD
              </button>

              {request.imageUrl && (
                <a 
                  href={request.imageUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full py-5 bg-zinc-900 border border-zinc-800 text-indigo-400 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl"
                >
                  <Camera size={18} /> View_Capture
                </a>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showChat && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-12 pt-12 border-t border-zinc-900 relative z-10"
                data-html2canvas-ignore
              >
                <AdminRequestChat requestId={request.id} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {isCapturing && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-[2.5rem] z-50 flex flex-col items-center justify-center gap-4 border border-indigo-500/50">
          <Clock size={40} className="animate-spin text-indigo-500" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">Capturing_Visual_Packet...</p>
        </div>
      )}
    </motion.div>
  );
}

function StatusAction({ active, onClick, icon, label, color }: { active: boolean, onClick: () => void, icon: any, label: string, color: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all
        ${active ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-900/50 text-zinc-600'}`}
    >
      <div className={active ? color : ''}>{icon}</div>
      <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function AdminRequestChat({ requestId }: { requestId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'requests', requestId, 'messages'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)));
    });
    return () => unsub();
  }, [requestId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await addDoc(collection(db, 'requests', requestId, 'messages'), {
        text,
        sender: 'admin',
        createdAt: serverTimestamp()
      });
      setText('');
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-h-80 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
        {messages.length === 0 && (
          <div className="text-center py-10 opacity-30 text-[10px] font-mono uppercase tracking-widest">No transaction records found.</div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-xs font-medium leading-relaxed ${m.sender === 'admin' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-zinc-800 text-zinc-300 rounded-tl-none'}`}>
              <p>{m.text}</p>
              <p className={`text-[8px] mt-2 font-mono uppercase opacity-50 ${m.sender === 'admin' ? 'text-right' : 'text-left'}`}>
                {m.createdAt?.toDate().toLocaleTimeString() || 'Sent'}
              </p>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-3">
        <input 
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Transmit message to user endpoint..."
          className="flex-1 bg-black border border-zinc-800 rounded-xl px-5 py-3 text-xs text-white focus:border-indigo-500 outline-none"
        />
        <button className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all flex items-center justify-center">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    accepted: 'bg-green-500/10 text-green-500 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status as keyof typeof styles]}`}>
      {status}
    </span>
  );
}

function Loader2(props: any) {
  return <Clock {...props} className="animate-spin" />;
}

function FormInput({ label, value, onChange, placeholder }: any) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.3em] font-black text-zinc-700 mb-3">{label}</label>
      <input 
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-4 text-white focus:border-indigo-500 outline-none text-sm font-medium transition-all"
      />
    </div>
  );
}

function FormTextarea({ label, value, onChange, placeholder }: any) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.3em] font-black text-zinc-700 mb-3">{label}</label>
      <textarea 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-4 text-white focus:border-indigo-500 outline-none text-sm font-medium transition-all min-h-[120px] resize-none"
      />
    </div>
  );
}
