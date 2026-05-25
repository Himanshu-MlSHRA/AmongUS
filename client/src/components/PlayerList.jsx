import { Crown, MicOff, UserMinus, AlertOctagon, CheckCircle2, Skull, Check, X } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

export function PlayerList({
  players = [],
  selfId,
  hostId,
  variant = 'lobby',          // 'lobby' | 'game' | 'meeting'
  onSelect,
  onKick,
  onMute,
  meetingVotes,                // { voterId: targetId }
  pendingTargetId,             // local pending target during meeting
  onConfirmVote,
  onCancelVote,
  votingDisabled,              // true during discussion phase
}) {
  const isHostViewer = selfId === hostId;
  const myConfirmedVote = meetingVotes?.[selfId];
  const hasConfirmedVote = myConfirmedVote != null;

  return (
    <div className="flex flex-col gap-2">
      {players.map((p) => {
        const isSelf = p.id === selfId;
        const isHostP = p.isHost;
        const dead = !p.isAlive;
        const votedFor = myConfirmedVote === p.id;
        const isPending = variant === 'meeting' && pendingTargetId === p.id;
        const voteCount = meetingVotes
          ? Object.values(meetingVotes).filter((t) => t === p.id).length
          : 0;

        const canClickInMeeting =
          variant === 'meeting' && !!onSelect && !dead && !votingDisabled && !hasConfirmedVote;

        return (
          <div
            key={p.id}
            className={`relative group flex items-center gap-3 px-3 py-2 rounded-md border text-left transition
              ${dead ? 'opacity-50 grayscale' : ''}
              ${isSelf
                ? 'border-neon-orange bg-cream-100 dark:bg-terminal-700 ring-1 ring-neon-orange/60'
                : 'border-ink-900/40 dark:border-terminal-500 bg-cream-50 dark:bg-terminal-800 hover:bg-cream-100 dark:hover:bg-terminal-700'}
              ${votedFor ? '!ring-2 !ring-neon-cyan/80' : ''}
              ${isPending ? '!ring-2 !ring-neon-amber animate-pulse' : ''}
              ${p.suspicious ? 'bg-red-100 dark:bg-red-900/30 border-red-400' : ''}`}
          >
            <button
              type="button"
              disabled={
                variant === 'meeting'
                  ? !canClickInMeeting
                  : (!onSelect || dead)
              }
              onClick={() => {
                if (variant === 'meeting') {
                  if (!canClickInMeeting) return;
                  onSelect?.(p.id);
                } else {
                  onSelect?.(p.id);
                }
              }}
              className="flex items-center gap-3 flex-1 min-w-0 disabled:cursor-default"
            >
              <Avatar name={p.name} src={p.avatar} size={32} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-sm truncate">{p.name}</span>
                  {isHostP && <Crown size={12} className="text-neon-amber" title="Host" />}
                  {p.isMuted && <MicOff size={12} className="opacity-70" title="Muted" />}
                  {dead && <Skull size={12} className="opacity-70" />}
                  {p.isImposter && <AlertOctagon size={12} className="text-red-500" title="Imposter" />}
                </div>
                <div className="text-[11px] opacity-60 font-mono">
                  {isSelf ? 'you' : isHostP ? 'host' : variant === 'game' && p.ready ? 'ready' : 'crewmate'}
                </div>
              </div>
            </button>

            {variant === 'meeting' && voteCount > 0 && !isPending && (
              <span className="label-chip !py-0.5 !px-2 text-[11px]">{voteCount}×</span>
            )}

            {/* X / ✓ confirmation overlay buttons during meeting */}
            {variant === 'meeting' && isPending && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onCancelVote?.(); }}
                  className="p-1.5 rounded-md border border-red-500 bg-red-950/30 text-red-400 hover:bg-red-500 hover:text-white transition"
                  title="Cancel"
                >
                  <X size={14} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onConfirmVote?.(p.id); }}
                  className="p-1.5 rounded-md border border-emerald-500 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-500 hover:text-white transition animate-pulse"
                  title="Confirm vote"
                >
                  <Check size={14} />
                </button>
              </div>
            )}

            {variant === 'lobby' && isHostViewer && !isHostP && (
              <span className="hidden group-hover:flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onMute?.(p.id); }}
                  className="btn btn-sm btn-ghost p-1"
                  title={p.isMuted ? 'Unmute' : 'Mute'}
                >
                  <MicOff size={12} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onKick?.(p.id); }}
                  className="btn btn-sm btn-ghost p-1 text-red-500"
                  title="Kick"
                >
                  <UserMinus size={12} />
                </button>
              </span>
            )}

            {variant === 'game' && p.ready && (
              <CheckCircle2 size={14} className="text-neon-green" />
            )}
          </div>
        );
      })}
    </div>
  );
}
