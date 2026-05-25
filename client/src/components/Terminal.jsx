import { Terminal as TerminalIcon } from 'lucide-react';

export function Terminal({ result, runRequest }) {
  return (
    <div className="h-full flex flex-col font-mono text-[12px] bg-terminal-900 text-cream-100 rounded-md border border-ink-900 dark:border-terminal-500 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-terminal-500 bg-terminal-800">
        <TerminalIcon size={12} className="text-neon-green" />
        <span className="text-[10px] uppercase tracking-widest opacity-70">stdout</span>
        <span className="ml-auto text-[10px] opacity-50">node-vm</span>
      </div>
      <div className="flex-1 overflow-y-auto nice-scroll p-3 space-y-1">
        {!result && !runRequest && (
          <Line dim>{'> waiting for run request…'}</Line>
        )}
        {runRequest && !result && (
          <>
            <Line><span className="text-neon-cyan">»</span> run requested ({runRequest.approvals.length} approval{runRequest.approvals.length !== 1 ? 's' : ''})</Line>
            <Line dim>awaiting majority approval to execute…</Line>
          </>
        )}
        {result?.logs?.map((l, i) => (
          <Line key={`l${i}`}>{l}</Line>
        ))}
        {result?.error && <Line err>{result.error}</Line>}
        {result?.cases?.map((c, i) => (
          <Line key={i} ok={c.passed} err={!c.passed}>
            {c.passed ? '✓' : '✗'} case {i + 1}: solution({JSON.stringify(c.args).slice(1, -1)}) → {JSON.stringify(c.got)}
            {!c.passed && !c.error && (
              <span className="opacity-70"> (expected {JSON.stringify(c.expect)})</span>
            )}
            {c.error && <span className="text-red-400"> {c.error}</span>}
          </Line>
        ))}
        {result && (
          <Line>
            <span className="text-neon-amber">{'> '}</span>
            {result.passed}/{result.total} tests passed
          </Line>
        )}
      </div>
    </div>
  );
}

function Line({ children, dim, ok, err }) {
  return (
    <div
      className={
        dim ? 'opacity-50'
        : ok ? 'text-neon-green'
        : err ? 'text-red-400'
        : 'text-cream-100'
      }
    >
      {children}
    </div>
  );
}
