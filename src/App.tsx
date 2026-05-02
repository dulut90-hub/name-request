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

  const getGuestUser = () => {
    const storedGuestUid = localStorage.getItem('guest_uid');
    if (storedGuestUid) {
      return { uid: storedGuestUid, isAnonymous: true };
    }

    const nextGuestUid = 'guest-' + Math.random().toString(36).slice(2, 7);
    localStorage.setItem('guest_uid', nextGuestUid);
    return { uid: nextGuestUid, isAnonymous: true };
  };

  const getCachedProfile = (uid: string) => {
    try {
      const cached = localStorage.getItem(`profile_${uid}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  };

  const cacheProfile = (uid: string, nextProfile: any) => {
    localStorage.setItem(`profile_${uid}`, JSON.stringify(nextProfile));
  };

  const isAnonymousAuthRestricted = () => localStorage.getItem('anonymous_auth_restricted') === 'true';
  const markAnonymousAuthRestricted = () => localStorage.setItem('anonymous_auth_restricted', 'true');

  useEffect(() => {
    const cachedAdminAuth = localStorage.getItem('admin_authenticated');
    if (cachedAdminAuth === 'true') {
      setIsAdminAuthenticated(true);
    }

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        if (isAnonymousAuthRestricted()) {
          const guestUser = getGuestUser();
          setUser(guestUser);
          const cachedProfile = getCachedProfile(guestUser.uid);
          if (cachedProfile) setProfile(cachedProfile);
          setLoading(false);
          return;
        }

        try {
          await signInAnonymously(auth);
        } catch (e: any) {
          const isRestricted = e?.code === 'auth/admin-restricted-operation' || e?.message?.includes('admin-restricted-operation');
          if (isRestricted) {
            markAnonymousAuthRestricted();
            console.warn("Anonymous Auth is restricted in this project. Using guest context.");
            const guestUser = getGuestUser();
            setUser(guestUser);
            const cachedProfile = getCachedProfile(guestUser.uid);
            if (cachedProfile) setProfile(cachedProfile);
          } else {
            console.error("Auth failed:", e?.message || e);
          }
        }
      } else {
        setUser(u);
        const cachedProfile = getCachedProfile(u.uid);
        if (cachedProfile) {
          setProfile(cachedProfile);
        }
        try {
          const profileSnap = await getDocFromServer(doc(db, 'profiles', u.uid));
          if (profileSnap.exists()) {
            const remoteProfile = { id: profileSnap.id, ...profileSnap.data() };
            setProfile(remoteProfile);
            cacheProfile(u.uid, remoteProfile);
          }
        } catch (err) {
          console.warn("Profile fetch restricted:", err);
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
        onLogout={() => {
          setIsAdminAuthenticated(false);
          localStorage.removeItem('admin_authenticated');
        }} 
        currentView={view} 
        setView={setView} 
        isAdmin={isAdminAuthenticated}
      />

      {user && !profile && !isAdminAuthenticated && (
        <IdentityOnboarding
          userId={user.uid}
          onComplete={(name) => {
            const nextProfile = { id: user.uid, name };
            setProfile(nextProfile);
            cacheProfile(user.uid, nextProfile);
          }}
        />
      )}

      <main className="relative max-w-6xl mx-auto px-6 pt-12 pb-40 md:pb-24">
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
                <AdminLogin
                  onAuthenticated={() => {
                    setIsAdminAuthenticated(true);
                    localStorage.setItem('admin_authenticated', 'true');
                  }}
                />
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
              className="max-w-4xl mx-auto space-y-12"
            >
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full animate-pulse" />
                  <div className="relative w-28 h-28 rounded-[2.5rem] bg-zinc-950 border border-zinc-900 flex items-center justify-center text-indigo-500 shadow-3xl">
                    <Cpu size={48} className="animate-pulse" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight break-words">System_Control</h2>
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-12 h-[1px] bg-indigo-500/50" />
                    <p className="text-zinc-500 font-mono text-[9px] md:text-[10px] uppercase tracking-[0.25em] text-center">Command_Network // Live_Sync</p>
                    <div className="w-12 h-[1px] bg-indigo-500/50" />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <a 
                  href="https://whatsapp.com/channel/0029Vb8cslf8aKvEpFOaMC0m" 
                  target="_blank" 
                  rel="noreferrer"
                  className="group relative bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2rem] hover:border-green-500/50 transition-all overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                      <Cpu size={120} />
                    </motion.div>
                  </div>
                  <div className="relative z-10 space-y-6">
                    <div className="w-14 h-14 bg-black border border-zinc-800 rounded-2xl flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                      <Cpu size={28} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-white uppercase tracking-tight">Main_Command_Channel</h4>
                      <p className="text-zinc-500 text-xs mt-2 font-medium">Primary broadcast node for system updates and status reporting.</p>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-green-500/80 flex items-center gap-2">
                       Connect_Link <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                  </div>
                </a>

                <div className="bg-zinc-900/50 border border-zinc-900 p-8 rounded-[2rem] flex flex-col justify-center items-center text-center space-y-4">
                   <p className="text-zinc-600 text-[10px] font-mono leading-relaxed uppercase tracking-widest italic">"Security protocols are prioritized over speed. All nodes must verify identity before uplink."</p>
                   <div className="w-20 h-1 bg-zinc-800 rounded-full" />
                </div>
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
