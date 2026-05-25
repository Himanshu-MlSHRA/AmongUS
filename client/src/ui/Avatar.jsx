export function Avatar({ name = '?', src, size = 32, className = '' }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  const style = { width: size, height: size, fontSize: Math.max(10, size * 0.4) };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={style}
        className={`rounded-md border border-ink-900 dark:border-terminal-500 object-cover ${className}`}
      />
    );
  }

  // deterministic color from name
  const palette = ['#ff7a3d', '#22d3ee', '#4ade80', '#f5a524', '#ec4899', '#a78bfa'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  const bg = palette[Math.abs(hash) % palette.length];

  return (
    <div
      style={{ ...style, background: bg }}
      className={`rounded-md flex items-center justify-center font-mono font-bold text-ink-900 border border-ink-900 dark:border-terminal-500 ${className}`}
    >
      {initials}
    </div>
  );
}
