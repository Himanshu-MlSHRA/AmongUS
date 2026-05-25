import { useState } from 'react';
import { Copy, Check, Globe2, Lock } from 'lucide-react';

export function RoomHeader({ room }) {
  const [copied, setCopied] = useState(false);
  if (!room) return null;

  function copy() {
    navigator.clipboard?.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 panel-glass">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.3em] font-mono opacity-60">
            Lobby
          </span>
          {room.visibility === 'public' ? (
            <span className="label-chip text-[11px] py-0.5">
              <Globe2 size={12} /> Public
            </span>
          ) : (
            <span className="label-chip text-[11px] py-0.5">
              <Lock size={12} /> Private
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] uppercase tracking-[0.3em] font-mono opacity-70">
          Room Code
        </span>
        <button
          onClick={copy}
          className="label-chip !py-1.5 !px-3 hover:bg-cream-200 dark:hover:bg-terminal-600 transition"
          title="Click to copy"
        >
          <span className="heading-arcade text-sm text-neon-orange">
            {room.code}
          </span>
          {copied ? <Check size={14} className="text-neon-green" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}
