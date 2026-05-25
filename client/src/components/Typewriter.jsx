import { useEffect, useState } from 'react';

const DEFAULT_LINES = [
  "warning: 60% of bugs are imposters in disguise.",
  "your linter cannot save you now.",
  "skill issue? or sabotage? we'll never know.",
  "ship the function — or get ejected trying.",
  "stack overflow won't help you in the meeting room.",
  "every semicolon is a potential alibi.",
  "if it compiles, blame the imposter. if it doesn't, also blame the imposter.",
  "git blame, but make it social deduction.",
  "cmd+z works on code, not on accusations.",
];

export function Typewriter({
  lines = DEFAULT_LINES,
  typeSpeed = 38,
  deleteSpeed = 18,
  holdMs = 1600,
  className = '',
  caretClassName = '',
}) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState('typing'); // typing | holding | deleting

  useEffect(() => {
    const current = lines[idx % lines.length];
    let t;

    if (phase === 'typing') {
      if (text.length < current.length) {
        t = setTimeout(() => setText(current.slice(0, text.length + 1)), typeSpeed);
      } else {
        t = setTimeout(() => setPhase('deleting'), holdMs);
      }
    } else if (phase === 'deleting') {
      if (text.length > 0) {
        t = setTimeout(() => setText(current.slice(0, text.length - 1)), deleteSpeed);
      } else {
        setIdx((i) => (i + 1) % lines.length);
        setPhase('typing');
      }
    }

    return () => clearTimeout(t);
  }, [text, phase, idx, lines, typeSpeed, deleteSpeed, holdMs]);

  return (
    <div
      className={`inline-flex items-center justify-center gap-1 ${className}`}
      style={{
        fontFamily:
          "'Minecraft', 'Pixelify Sans', 'Silkscreen', 'Press Start 2P', monospace",
      }}
    >
      <span className="whitespace-pre">{text}</span>
      <span
        className={`inline-block w-[0.6ch] h-[1em] -mb-[2px] bg-current animate-pulse ${caretClassName}`}
        aria-hidden="true"
      />
    </div>
  );
}
