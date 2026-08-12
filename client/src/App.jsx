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
  // Delay showing the banner so it doesn't flash on first load
  const [showDisconnectBanner, setShowDisconnectBanner] = useState(false);
  // forces a re-render every second so meeting countdown ticks
  const [, setTick] = useState(0);

  // track connection & identify on (re)connect
  useEffect(() => {
    let bannerTimer = null;

    function onConnect() {
      setConnected(true);
      setShowDisconnectBanner(false);
      if (bannerTimer) { clearTimeout(bannerTimer); bannerTimer = null; }
      // Always re-identify on every connect/reconnect so the server has our session
      if (user.name) {
        socket.emit('session:identify', { name: user.name, avatar: user.avatar });
      }
    }
    function onDisconnect() {
      setConnected(false);
      // Wait 2s before showing the banner to avoid a flash on fast reconnects
      bannerTimer = setTimeout(() => setShowDisconnectBanner(true), 2000);
    }
    function onConnectError() {
      setConnected(false);
      bannerTimer = setTimeout(() => setShowDisconnectBanner(true), 2000);
    }
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    // Fire immediately if already connected
    if (socket.connected) onConnect();
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      if (bannerTimer) clearTimeout(bannerTimer);
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
      {/* Connection status banner — only shown after 2s delay to avoid flash */}
      {!connected && showDisconnectBanner && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
            background: 'linear-gradient(90deg, #b91c1c, #dc2626)',
            color: '#fff', textAlign: 'center',
            padding: '8px 16px', fontSize: '13px', fontFamily: 'monospace',
            letterSpacing: '0.05em', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
          }}
        >
          <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', fontSize: '14px' }}>↻</span>
          <span>Reconnecting to server…</span>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
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
