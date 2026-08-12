import { useEffect, useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Landing } from './pages/Landing';
import { Lobby } from './pages/Lobby';
import { Game } from './pages/Game';
import { KickedModal } from './components/KickedModal';
import { useRoomStore, useUserStore } from './lib/store';
import { socket } from './lib/socket';

function Router() {
  const room = useRoomStore((s) => s.room);
  const setRoom = useRoomStore((s) => s.setRoom);
  const setResult = useRoomStore((s) => s.setResult);
  const setBanner = useRoomStore((s) => s.setBanner);
  const reset = useRoomStore((s) => s.reset);
  const user = useUserStore();

  const [page, setPage] = useState('landing');     // landing | lobby | game
  const [kickedOpen, setKickedOpen] = useState(false);
  const [connected, setConnected] = useState(socket.connected);
  // forces a re-render every second so meeting countdown ticks
  const [, setTick] = useState(0);

  // track connection & identify on (re)connect
  useEffect(() => {
    function onConnect() {
      setConnected(true);
      // Always re-identify on every connect/reconnect so the server has our session
      if (user.name) {
        socket.emit('session:identify', { name: user.name, avatar: user.avatar });
      }
    }
    function onDisconnect() {
      setConnected(false);
    }
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    // Fire immediately if already connected
    if (socket.connected) onConnect();
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
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
      {/* Connection status banner */}
      {!connected && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
            background: '#ef4444', color: '#fff', textAlign: 'center',
            padding: '6px 12px', fontSize: '12px', fontFamily: 'monospace',
            letterSpacing: '0.05em',
          }}
        >
          ⚠ Disconnected from server — reconnecting…
        </div>
      )}
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
