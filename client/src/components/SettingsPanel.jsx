import { Lock } from 'lucide-react';

// Visible to everyone — only host can edit (others see it disabled).
export function SettingsPanel({ settings, isHost, onChange }) {
  if (!settings) return null;

  return (
    <div className="space-y-3">
      <Field
        label="Coding timer"
        suffix="s"
        min={60} max={1800} step={30}
        value={settings.codingTimer}
        disabled={!isHost}
        onChange={(v) => onChange({ codingTimer: v })}
      />
      <Field
        label="Discussion timer"
        suffix="s"
        min={10} max={180} step={5}
        value={settings.discussionTimer ?? 25}
        disabled={!isHost}
        onChange={(v) => onChange({ discussionTimer: v })}
      />
      <Field
        label="Voting timer"
        suffix="s"
        min={15} max={180} step={5}
        value={settings.votingTimer ?? 45}
        disabled={!isHost}
        onChange={(v) => onChange({ votingTimer: v })}
      />
      <Field
        label="Meeting cooldown"
        suffix="s"
        min={0} max={120} step={5}
        value={settings.meetingCooldown ?? 25}
        disabled={!isHost}
        onChange={(v) => onChange({ meetingCooldown: v })}
      />
      <Field
        label="Max players"
        min={4} max={15} step={1}
        value={settings.maxPlayers}
        disabled={!isHost}
        onChange={(v) => onChange({ maxPlayers: v })}
      />
      <Field
        label="Imposters"
        min={1} max={3} step={1}
        value={settings.imposterCount}
        disabled={!isHost}
        onChange={(v) => onChange({ imposterCount: v })}
      />
      {!isHost && (
        <div className="flex items-center gap-1.5 text-[11px] opacity-60 font-mono">
          <Lock size={12} /> Only the host can edit settings.
        </div>
      )}
    </div>
  );
}

function Field({ label, value, min, max, step, suffix, onChange, disabled }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] uppercase tracking-widest font-mono opacity-70">{label}</span>
        <span className="font-mono text-sm tabular-nums">{value}{suffix || ''}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-neon-orange disabled:opacity-50"
      />
    </div>
  );
}
