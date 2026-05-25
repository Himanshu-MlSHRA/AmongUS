import { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';

export function GameTimer({ endsAt, label = 'CODING TIME', warnAt = 60, dangerAt = 20 }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  if (!endsAt) return null;
  const remaining = Math.max(0, Math.ceil((endsAt - now) / 1000));
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  let tone = 'text-neon-green border-neon-green/60';
  if (remaining <= dangerAt) tone = 'text-red-400 border-red-500/70 animate-pulse';
  else if (remaining <= warnAt) tone = 'text-neon-amber border-neon-amber/70';

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border-2 bg-black/40 dark:bg-black/60 font-display tracking-widest ${tone}`}
      title={label}
    >
      <Timer size={16} />
      <span className="heading-pixel text-xs opacity-80 hidden sm:inline">{label}</span>
      <span className="crt-text text-2xl tabular-nums leading-none animate-crt-flicker">
        {mm}:{ss}
      </span>
    </div>
  );
}
