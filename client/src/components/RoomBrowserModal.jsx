import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Globe, Lock, Users, RefreshCw, KeyRound } from 'lucide-react';
import { socket } from '../lib/socket';

export function RoomBrowserModal({ open, onClose, onJoin, onCreate, busy, error }) {
  const [tab, setTab] = useState('public');   // 'public' | 'private'
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [codeErr, setCodeErr] = useState(null);

  function refresh() {
    setLoading(true);
    socket.emit('rooms:listAll', null, (list) => {
      setRooms(Array.isArray(list) ? list : []);
      setLoading(false);
    });
  }

  useEffect(() => {
    if (!open) return;
    refresh();
    const id = setInterval(refresh, 4000);
    return () => clearInterval(id);
  }, [open]);

  const filtered = useMemo(() => {
    return rooms.filter((r) => r.visibility === tab);
  }, [rooms, tab]);

  function handlePrivateJoin(e) {
    e?.preventDefault?.();
    const trimmed = code.trim().toUpperCase();
    if (!/^[A-Z0-9]{4}$/.test(trimmed)) {
      setCodeErr('Room code is 4 letters/numbers.');
      return;
    }
    setCodeErr(null);
    onJoin?.(trimmed);
  }

  return (
    <Modal
      open={open}
      onClose={busy ? undefined : onClose}
      title="Browse Rooms"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Close</Button>
          <Button variant="primary" onClick={() => onCreate?.('public')} disabled={busy}>
            Create public room
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setTab('public')}
          className={`btn btn-sm ${tab === 'public' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <Globe size={12} /> Public
        </button>
        <button
          onClick={() => setTab('private')}
          className={`btn btn-sm ${tab === 'private' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <Lock size={12} /> Private
        </button>
        <div className="flex-1" />
        <button onClick={refresh} className="btn btn-sm btn-ghost" title="Refresh">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {tab === 'private' && (
        <form
          onSubmit={handlePrivateJoin}
          className="mb-4 panel-glass p-3 flex flex-col sm:flex-row gap-2 items-stretch sm:items-end"
        >
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-widest font-mono opacity-70 mb-1">
              Have a code?
            </div>
            <input
              className="input"
              placeholder="ABCD"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\s/g, '').slice(0, 4).toUpperCase());
                setCodeErr(null);
              }}
              maxLength={4}
            />
            {codeErr && <div className="text-[11px] text-red-500 mt-1 font-mono">{codeErr}</div>}
          </div>
          <Button variant="primary" type="submit" disabled={busy}>
            <KeyRound size={12} /> Join with code
          </Button>
        </form>
      )}

      <div className="max-h-[50vh] overflow-y-auto nice-scroll -mx-1 px-1">
        {filtered.length === 0 ? (
          <div className="text-center py-10 font-mono text-sm opacity-60">
            {tab === 'public'
              ? 'No public rooms — be the first to host one.'
              : 'No private rooms listed. Ask the host for a code.'}
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map((r) => (
              <li
                key={r.code}
                className="flex items-center gap-3 panel p-3"
              >
                <div className="w-10 h-10 rounded-md flex items-center justify-center bg-cream-100 dark:bg-terminal-700 border border-ink-900/40 dark:border-terminal-500">
                  {r.visibility === 'public' ? <Globe size={16} /> : <Lock size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold tracking-widest text-base">
                    {r.code}
                  </div>
                  <div className="text-[11px] opacity-70 font-mono truncate">
                    Host · {r.hostName}
                    {r.state !== 'lobby' && (
                      <span className="ml-2 text-neon-amber">[ {r.state.toUpperCase()} ]</span>
                    )}
                  </div>
                </div>
                <div className="text-[11px] font-mono flex items-center gap-1 opacity-80">
                  <Users size={12} /> {r.players}/{r.maxPlayers}
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onJoin?.(r.code)}
                  disabled={busy || !r.canJoin}
                  title={!r.canJoin ? 'Cannot join — full or in progress' : 'Join'}
                >
                  Join
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <div className="mt-3 text-sm font-mono text-red-500">{error}</div>
      )}
    </Modal>
  );
}
