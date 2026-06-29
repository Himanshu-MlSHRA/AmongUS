import { useEffect, useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Landing } from './pages/Landing';
import { Lobby } from './pages/Lobby';
import { Game } from './pages/Game';
import { KickedModal } from './components/KickedModal';
import { useRoomStore, useUserStore } from './lib/store';
import { socket } from './lib/socket';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://amongus-w0vw.onrender.com';

function Router() {
  const room = useRoomStore((s) => s.room);
  const setRoom = useRoomStore((s) => s.setRoom);
  const setResult = useRoomStore((s) => s.setResult);
  const setBanner = useRoomStore((s) => s.setBanner);
  const reset = useRoomStore((s) => s.reset);
  const user = useUserStore();

  const [page, setPage] = useState('landing');     // landing | lobby | game
  const [kickedOpen, setKickedOpen] = useState(false);
  // forces a re-render every second so meeting countdown ticks
  const [, setTick] = useState(0);

  // Verify stored JWT token on app mount
  useEffect(() => {
    async function verifyStoredToken() {
      const token = user.token;
      if (!token) return;

      try {
        const res = await fetch(`${SERVER_URL}/auth/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();

        if (!res.ok || !data.ok) {
          // Token expired/invalid — clear it
          console.log('[auth] Stored token is invalid, clearing.');
          user.logout();
          return;
        }

        // Token is valid — update user info in case it changed
        user.setIdentity({
          name: data.user.name,
          avatar: data.user.avatar,
          email: data.user.email,
          provider: data.user.provider,
          token,
        });
      } catch (err) {
        console.error('[auth] Token verification failed:', err);
        // Network error — don't clear token, might just be offline
      }
    }

    verifyStoredToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // identify on connect
  useEffect(() => {
    function onConnect() {
      if (user.name) {
        socket.emit('session:identify', { name: user.name, avatar: user.avatar });
      }
    }
    socket.on('connect', onConnect);
    if (socket.connected) onConnect();
    return () => socket.off('connect', onConnect);
  }, [user.name, user.avatar]);

  // global socket listeners
  useEffect(() => {
    function onRoomState(r) {
      setRoom(r);
      if (r.state === 'lobby') {
        setResult(null);
        setPage('lobby');
      } else if (r.state === 'playing' || r.state === 'meeting' || r.state === 'ended') {
        setPage('game');
      }
    }
    function onKicked() {
      setKickedOpen(true);
      reset();
      setPage('landing');
    }
    function onRunResult(r) {
      setResult(r);
    }
    socket.on('room:state', onRoomState);
    socket.on('room:kicked', onKicked);
    socket.on('run:result', onRunResult);
    return () => {
      socket.off('room:state', onRoomState);
      socket.off('room:kicked', onKicked);
      socket.off('run:result', onRunResult);
    };
  }, [setRoom, setResult, setBanner, reset]);

  // ticking clock for meeting countdown
  useEffect(() => {
    if (room?.state !== 'meeting') return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [room?.state]);

  function handleEnterRoom() {
    // server emits room:state which moves us; nothing to do here
  }
  function handleLeave() {
    reset();
    setPage('landing');
  }

  return (
    <>
      {page === 'landing' && <Landing onEnterRoom={handleEnterRoom} />}
      {page === 'lobby' && <Lobby onLeave={handleLeave} />}
      {page === 'game' && <Game onLeave={handleLeave} />}
      <KickedModal open={kickedOpen} onClose={() => setKickedOpen(false)} />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router />
    </ThemeProvider>
  );
}
