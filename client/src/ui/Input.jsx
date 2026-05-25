export function Input({ className = '', label, hint, error, ...rest }) {
  return (
    <label className="block">
      {label && (
        <div className="mb-1 text-xs uppercase tracking-widest text-ink-700 dark:text-cream-100/70 font-mono">
          {label}
        </div>
      )}
      <input className={`input ${error ? 'border-red-500 focus:ring-red-400' : ''} ${className}`} {...rest} />
      {hint && !error && (
        <div className="mt-1 text-[11px] font-mono text-ink-700/70 dark:text-cream-100/50">{hint}</div>
      )}
      {error && <div className="mt-1 text-[11px] font-mono text-red-500">{error}</div>}
    </label>
  );
}
