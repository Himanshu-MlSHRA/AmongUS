import { useState } from 'react';
import { Heart, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

export function ProblemPanel({ problem, lives = 3, totalLives = 3 }) {
  const [showHint, setShowHint] = useState(false);
  if (!problem) return null;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-ink-900/30 dark:border-terminal-500">
        <div className="text-[10px] uppercase tracking-widest opacity-60 font-mono">Challenge</div>
        <h2 className="heading text-lg leading-tight">{problem.title}</h2>
      </div>

      <div className="flex-1 overflow-y-auto nice-scroll p-4 space-y-4 text-sm font-mono">
        <p className="leading-relaxed">{problem.instructions}</p>

        <button
          onClick={() => setShowHint((v) => !v)}
          className="w-full flex items-center justify-between text-left px-3 py-2 rounded-md border border-ink-900/40 dark:border-terminal-500 bg-cream-100/50 dark:bg-terminal-700/60 hover:bg-cream-100 dark:hover:bg-terminal-700"
        >
          <span className="flex items-center gap-2">
            <Lightbulb size={14} className="text-neon-amber" />
            Hint
          </span>
          {showHint ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {showHint && (
          <div className="text-[12px] opacity-80 px-3 py-2 rounded-md border border-dashed border-ink-900/40 dark:border-terminal-500">
            {problem.hint}
          </div>
        )}

        <div>
          <div className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Examples</div>
          <div className="space-y-2">
            {problem.examples.map((ex, i) => (
              <div key={i} className="rounded-md border border-ink-900/40 dark:border-terminal-500 overflow-hidden">
                <div className="px-2 py-1 bg-cream-100/60 dark:bg-terminal-700 text-[11px] uppercase tracking-widest opacity-70">
                  case {i + 1}
                </div>
                <div className="px-2.5 py-2 text-[12px]">
                  <div><span className="opacity-60">in:</span> {ex.input}</div>
                  <div><span className="opacity-60">out:</span> {ex.output}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-ink-900/30 dark:border-terminal-500 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest opacity-60 font-mono">lives</span>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalLives }).map((_, i) => (
            <Heart
              key={i}
              size={16}
              fill={i < lives ? '#ef4444' : 'transparent'}
              className={i < lives ? 'text-red-500' : 'text-ink-700/40 dark:text-cream-100/30'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
