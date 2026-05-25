import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Globe, Lock } from 'lucide-react';

export function CreateRoomModal({ open, onClose, onConfirm, busy }) {
  const [choice, setChoice] = useState('public');
  return (
    <Modal
      open={open}
      onClose={busy ? undefined : onClose}
      title="Create a Room"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant="primary" onClick={() => onConfirm?.(choice)} disabled={busy}>
            {busy ? 'Creating…' : 'Create'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ChoiceCard
          active={choice === 'public'}
          onClick={() => setChoice('public')}
          icon={<Globe size={18} />}
          title="Public Room"
          desc="Listed in matchmaking — anyone can join."
        />
        <ChoiceCard
          active={choice === 'private'}
          onClick={() => setChoice('private')}
          icon={<Lock size={18} />}
          title="Private Room"
          desc="Hidden — only players with the room code can join."
        />
      </div>
    </Modal>
  );
}

function ChoiceCard({ active, onClick, icon, title, desc }) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-md border p-3 transition shadow-retro
        ${active
          ? 'border-neon-orange bg-cream-100 dark:bg-terminal-700 ring-2 ring-neon-orange/60'
          : 'border-ink-900/40 bg-cream-50 dark:bg-terminal-800 dark:border-terminal-500 hover:bg-cream-100 dark:hover:bg-terminal-700'}`}
    >
      <div className="flex items-center gap-2 mb-1.5 text-ink-900 dark:text-cream-100">
        {icon}
        <span className="font-mono font-bold uppercase tracking-wide text-sm">{title}</span>
      </div>
      <div className="text-[12px] font-mono text-ink-700 dark:text-cream-100/60">{desc}</div>
    </button>
  );
}
