import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Globe2, KeyRound, Hammer, ArrowLeft, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/Button';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { Typewriter } from '../components/Typewriter';
import { AuthModal } from '../components/AuthModal';
import { SettingsModal } from '../components/SettingsModal';
import { CreateRoomModal } from '../components/CreateRoomModal';
import { JoinRoomModal } from '../components/JoinRoomModal';
import { RoomBrowserModal } from '../components/RoomBrowserModal';
import { Avatar } from '../ui/Avatar';
import { useUserStore, useRoomStore } from '../lib/store';
import { useTheme } from '../context/ThemeContext';
import { socket } from '../lib/socket';

export function Landing({ onEnterRoom }) {
  const user = useUserStore();
  const setBanner = useRoomStore((s) => s.setBanner);
  const banner = useRoomStore((s) => s.banner);
  const { theme, toggleTheme } = useTheme();

  const [authOpen, setAuthOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [busy, setBusy] = useState(null);
  const [joinError, setJoinError] = useState(null);
  const [browseError, setBrowseError] = useState(null);

  function ensureIdentity() {
    if (!user.name) { setAuthOpen(true); return false; }
    socket.emit('session:identify', { name: user.name, avatar: user.avatar });
    return true;
  }

  function createRoom(visibility) {
    if (!ensureIdentity()) return;
    setBusy('create');
    socket.emit('session:identify', { name: user.name, avatar: user.avatar }, () => {
      socket.emit('room:create', { visibility }, (res) => {
        setBusy(null);
        if (res?.error) { setBanner({ kind: 'error', text: res.error }); return; }
        setCreateOpen(false);
        onEnterRoom?.(res.code);
      });
    });
  }

  function joinRoom(code) {
    if (!ensureIdentity()) return;
    setBusy('join');
    setJoinError(null);
    socket.emit('session:identify', { name: user.name, avatar: user.avatar }, () => {
      socket.emit('room:join', { code }, (res) => {
        setBusy(null);
        if (res?.error) { setJoinError(res.error); return; }
        setJoinOpen(false);
        onEnterRoom?.(res.code);
      });
    });
  }

  function playOnline() {
    if (!ensureIdentity()) return;
    setBrowseError(null);
    setBrowseOpen(true);
  }

  function browseJoin(code) {
    if (!ensureIdentity()) return;
    setBusy('online');
    setBrowseError(null);
    socket.emit('session:identify', { name: user.name, avatar: user.avatar }, () => {
      socket.emit('room:join', { code }, (res) => {
        setBusy(null);
        if (res?.error) { setBrowseError(res.error); return; }
        setBrowseOpen(false);
        onEnterRoom?.(res.code);
      });
    });
  }

  function browseCreate(visibility) {
    if (!ensureIdentity()) return;
    setBusy('online');
    socket.emit('session:identify', { name: user.name, avatar: user.avatar }, () => {
      socket.emit('room:create', { visibility }, (res) => {
        setBusy(null);
        if (res?.error) { setBrowseError(res.error); return; }
        setBrowseOpen(false);
        onEnterRoom?.(res.code);
      });
    });
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col">
      <AnimatedBackground />

      {/* Top bar — full width */}
      <header className="w-full px-5 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="btn btn-sm btn-ghost"
            title="Back"
            onClick={() => history.length > 1 ? history.back() : null}
          >
            <ArrowLeft size={14} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn btn-sm btn-ghost"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button
            onClick={() => setAuthOpen(true)}
            className="btn btn-sm gap-2"
            title="Profile"
          >
            {user.name ? (
              <>
                <Avatar name={user.name} src={user.avatar} size={20} />
                <span className="hidden sm:inline">{user.name}</span>
              </>
            ) : (
              <>
                <User size={14} />
                <span className="hidden sm:inline">Sign in</span>
              </>
            )}
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="btn btn-sm"
            title="Settings"
          >
            <Settings size={14} />
          </button>
        </div>
      </header>

      {/* Center content — flex grow so it fills the rest */}
      <main className="flex-1 flex items-center justify-center px-5 sm:px-8">
        <motion.div
          className="w-full max-w-3xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-8">
            <h1 className="heading headline text-5xl sm:text-7xl font-display animate-flicker">
              AmongUs for{' '}
              <span className="text-neon-orange">&lt;C&gt;</span>oders
            </h1>
            <div className="mt-6 min-h-[2.6em] flex items-center justify-center px-4">
              <Typewriter
                className="font-mc text-[18px] sm:text-[22px] tracking-wide text-ink-900/90 dark:text-cream-100/90 max-w-2xl text-center"
                caretClassName="bg-neon-orange"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <MenuButton
              icon={<Globe2 size={18} />}
              title="Play Online"
              desc="Quick match"
              onClick={playOnline}
              busy={busy === 'online'}
            />
            <MenuButton
              icon={<KeyRound size={18} />}
              title="Join Room"
              desc="Enter a code"
              onClick={() => setJoinOpen(true)}
              busy={busy === 'join'}
            />
            <MenuButton
              icon={<Hammer size={18} />}
              title="Create Room"
              desc="You're the host"
              onClick={() => setCreateOpen(true)}
              busy={busy === 'create'}
            />
          </div>

          {banner && (
            <div className={`mt-4 panel px-4 py-2 text-sm font-mono ${banner.kind === 'error' ? 'text-red-500' : ''}`}>
              {banner.text}
              <button className="float-right text-xs opacity-60" onClick={() => setBanner(null)}>dismiss</button>
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full px-5 sm:px-8 py-4 flex items-center justify-between text-[11px] uppercase tracking-widest font-mono opacity-60">
        <span>{user.name ? `signed in as ${user.name}` : 'guest mode'}</span>
      </footer>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <CreateRoomModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onConfirm={createRoom}
        busy={busy === 'create'}
      />
      <JoinRoomModal
        open={joinOpen}
        onClose={() => { setJoinOpen(false); setJoinError(null); }}
        onConfirm={joinRoom}
        busy={busy === 'join'}
        error={joinError}
      />
      <RoomBrowserModal
        open={browseOpen}
        onClose={() => { setBrowseOpen(false); setBrowseError(null); }}
        onJoin={browseJoin}
        onCreate={browseCreate}
        busy={busy === 'online'}
        error={browseError}
      />
    </div>
  );
}

function MenuButton({ icon, title, desc, onClick, busy }) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={busy}
      className="group panel-glass p-5 text-left disabled:opacity-60 disabled:cursor-wait"
    >
      <div className="flex items-center gap-2 mb-2 text-neon-orange">
        {icon}
        <span className="font-display font-bold uppercase tracking-wider text-sm">{title}</span>
      </div>
      <div className="font-mono text-[12px] opacity-70">{busy ? 'connecting…' : desc}</div>
      <div className="mt-3 h-px bg-ink-900/30 dark:bg-neon-orange/30 group-hover:bg-neon-orange transition-colors" />
    </motion.button>
  );
}
