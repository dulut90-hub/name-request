import React from 'react';
import { motion } from 'motion/react';
import { Megaphone, Calendar } from 'lucide-react';
import { Announcement } from '../types';

export default function AnnouncementList({ announcements }: { announcements: Announcement[] }) {
  if (announcements.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
          <Megaphone size={16} />
        </div>
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">Announcements</h2>
      </div>

      <div className="space-y-4">
        {announcements.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group p-6 bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800 transition-all rounded-2xl relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
              <div className="flex flex-col md:flex-row gap-6">
                {item.imageUrl && (
                  <div className="w-full md:w-32 h-32 shrink-0 rounded-xl overflow-hidden border border-zinc-800">
                    <img src={item.imageUrl} alt="System Broadcast" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                )}
                <div className="flex-1 flex flex-col justify-between gap-4">
                  <p className="text-zinc-200 text-lg leading-relaxed">{item.content}</p>
                  <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
                    <Calendar size={12} />
                    {item.createdAt?.toDate().toLocaleDateString() || 'Recently'}
                  </div>
                </div>
              </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
