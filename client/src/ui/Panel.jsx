export function Panel({ className = '', children, glass = false, ...rest }) {
  return (
    <div className={`${glass ? 'panel-glass' : 'panel'} ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function PanelHeader({ children, right }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-ink-900/40 dark:border-terminal-500 bg-cream-100/40 dark:bg-terminal-700/40">
      <div className="heading-pixel text-sm uppercase text-ink-900 dark:text-cream-100/90">
        {children}
      </div>
      {right}
    </div>
  );
}
