import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Hourglass, Vote } from 'lucide-react';
import { ChatPanel } from './ChatPanel';

export function MeetingPanel({
  meeting,
  chat,
  onSend,
  selfName,
  selfMuted,
  selfAlive,
  caller,
  hint,
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.max(0, Math.ceil((meeting.endsAt - now) / 1000));
  const isVoting = meeting.phase === 'voting';

  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden bg-cream-50 dark:bg-terminal-900 rounded-md border-2 border-neon-orange">
      {/* alert banner */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`px-4 py-3 flex items-center justify-between gap-3 border-b-2 ${
          isVoting
            ? 'border-neon-cyan bg-cyan-950/40 text-neon-cyan'
            : 'border-neon-amber bg-amber-950/30 text-neon-amber'
        }`}
      >
        <div className="flex items-center gap-2">
          {isVoting ? <Vote size={18} /> : <Bell size={18} className="animate-pulse" />}
          <div>
            <div className="font-display uppercase tracking-widest text-base sm:text-lg">
              {isVoting ? 'VOTING IN PROGRESS' : 'EMERGENCY MEETING — DISCUSS'}
            </div>
            <div className="font-mono text-[11px] opacity-80">
              {caller ? `Called by ${caller.name}` : 'Discuss who is sus'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Hourglass size={14} className="opacity-80" />
          <span className="font-mono text-2xl tabular-nums font-bold">
            {String(remaining).padStart(2, '0')}s
          </span>
        </div>
      </motion.div>

      {hint && (
        <div className="px-4 py-2 text-[12px] font-mono opacity-80 border-b border-ink-900/30 dark:border-terminal-500 bg-amber-50/40 dark:bg-amber-900/10">
          {hint}
        </div>
      )}

      <div className="flex-1 min-h-0">
        <ChatPanel
          messages={chat}
          onSend={onSend}
          disabled={!selfAlive || selfMuted}
          selfName={selfName}
          placeholder={isVoting ? 'Make your case…' : 'Discuss who is sus…'}
        />
      </div>
    </div>
  );
}
