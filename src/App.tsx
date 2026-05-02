import React, { useState, useEffect } from 'react';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, doc, getDocFromServer } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Announcement } from './types';
import { Cpu } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import RequestForm from './components/RequestForm';
import RequestHistory from './components/RequestHistory';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import AnnouncementList from './components/AnnouncementList';
import Showcase from './components/Showcase';
import IdentityOnboarding from './components/IdentityOnboarding';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'home' | 'history' | 'admin' | 'new-request' | 'showcase' | 'tools'>('home');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        try {
          await signInAnonymously(auth);
        } catch (e) {
          console.error("Auth failed", e);
        }
      } else {
        setUser(u);
        const profileSnap = await getDocFromServer(doc(db, 'profiles', u.uid));
        if (profileSnap.exists()) {
          setProfile({ id: profileSnap.id, ...profileSnap.data() });
        }
      }
      setLoading(false);
    });

    // Listen for announcements
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsubAnnounce = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
      setAnnouncements(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'announcements');
    });

    return () => {
      unsubscribe();
      unsubAnnounce();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-cyan-500 font-mono text-xs animate-pulse tracking-[0.5em]">
          ESTABLISHING_SECURE_NODE...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/5 blur-[150px] rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>

      <Navbar 
        onLogout={() => setIsAdminAuthenticated(false)} 
        currentView={view} 
        setView={setView} 
        isAdmin={isAdminAuthenticated}
      />

      {user && !profile && !isAdminAuthenticated && (
        <IdentityOnboarding userId={user.uid} onComplete={(name) => setProfile({ id: user.uid, name })} />
      )}

      <main className="relative max-w-6xl mx-auto px-6 pt-12 pb-32 md:pb-24">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-24"
            >
              <div className="pt-8">
                <AnnouncementList announcements={announcements} />
              </div>
              <Hero onAction={() => setView('new-request')} />
              <div className="bg-zinc-900/10 border border-zinc-900/50 rounded-[3rem] p-12 text-center md:p-20">
                <div className="max-w-2xl mx-auto space-y-6">
                  <h3 className="text-3xl font-black text-white uppercase tracking-tight">Active_Integration</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">Our synthesis protocols are currently operating at 99.9% uptime. Initialize a request to begin production.</p>
                  <button 
                    onClick={() => setView('showcase')}
                    className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 hover:text-white transition-all underline underline-offset-8"
                  >
                    Explore_The_Archives
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'new-request' && (
            <motion.div
              key="new-request"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <RequestForm profile={profile} user={user} onComplete={() => setView('history')} onCancel={() => setView('home')} />
            </motion.div>
          )}

          {view === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <RequestHistory user={user} />
            </motion.div>
          )}

          {view === 'showcase' && (
            <motion.div
              key="showcase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Showcase />
            </motion.div>
          )}

          {view === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {!isAdminAuthenticated ? (
                <AdminLogin onAuthenticated={() => setIsAdminAuthenticated(true)} />
              ) : (
                <AdminPanel />
              )}
            </motion.div>
          )}

          {view === 'tools' && (
            <motion.div
              key="tools"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-40 text-center space-y-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full animate-pulse" />
                <div className="relative w-28 h-28 rounded-[2.5rem] bg-zinc-950 border border-zinc-900 flex items-center justify-center text-indigo-500 shadow-3xl">
                  <Cpu size={48} className="animate-pulse" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Tools_Expansion</h2>
                <div className="flex items-center justify-center gap-3">
                   <div className="w-12 h-[1px] bg-indigo-500/50" />
                   <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.5em]">System_Update_Incoming // Restricted_Access</p>
                   <div className="w-12 h-[1px] bg-indigo-500/50" />
                </div>
              </div>
              <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl max-w-sm">
                <p className="text-zinc-600 text-xs leading-relaxed italic">"The synthesis laboratory is undergoing structural reconfiguration. New algorithmic tools will be deployed shortly."</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-12 border-t border-zinc-900/50 text-center">
        <p className="text-zinc-700 text-[10px] font-mono tracking-widest uppercase">
          &copy; 2026 Name-Request Systems &bull; Virtualized Environment
        </p>
      </footer>
    </div>
  );
}
