import { useMemo } from 'react';
import { Play, LogOut, Users, MessageSquare, Sliders, ArrowLeft, Sun, Moon, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Panel, PanelHeader } from '../ui/Panel';
import { RoomHeader } from '../components/RoomHeader';
import { PlayerList } from '../components/PlayerList';
import { ChatPanel } from '../components/ChatPanel';
import { SettingsPanel } from '../components/SettingsPanel';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { useRoomStore, useUserStore } from '../lib/store';
import { socket } from '../lib/socket';
import { useTheme } from '../context/ThemeContext';

export function Lobby({ onLeave }) {
  const room = useRoomStore((s) => s.room);
  const setBanner = useRoomStore((s) => s.setBanner);
  const user = useUserStore();
  const { theme, toggleTheme } = useTheme();

  const selfId = useMemo(() => socket.id, [room?.code]);
  const isHost = room?.hostId === selfId;

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono opacity-60">
        Connecting…
      </div>
    );
  }

  function handleStart() {
    socket.emit('game:start', null, (res) => {
      if (res?.error) setBanner({ kind: 'error', text: res.error });
    });
  }

  function handleLeave() {
    socket.emit('room:leave');
    onLeave?.();
  }

  function handleKick(targetId) {
    socket.emit('room:kick', { targetId });
  }
  function handleMute(targetId) {
    socket.emit('room:mute', { targetId });
  }
  function handleSettings(patch) {
    socket.emit('room:settings', { settings: patch });
  }
  function handleSend(text) {
    socket.emit('chat:send', { text });
  }

  const enoughPlayers = room.players.length >= 4;

  return (
    <div className="relative min-h-screen flex flex-col">
      <AnimatedBackground />

      <header className="w-full px-5 sm:px-8 py-3 flex items-center justify-between gap-3">
        <button onClick={handleLeave} className="btn btn-sm">
          <ArrowLeft size={14} /> <span>Leave</span>
        </button>
        <div className="font-mono text-[11px] uppercase tracking-widest opacity-60">
          Lobby · {room.players.length}/{room.settings.maxPlayers} players
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="btn btn-sm btn-ghost" title="Theme">
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </header>

      <div className="flex-1 w-full max-w-7xl mx-auto px-5 sm:px-8 pb-8 grid grid-cols-12 gap-4 min-h-0">
        <div className="col-span-12">
          <RoomHeader room={room} />
        </div>

        {/* Left — players */}
        <div className="col-span-12 lg:col-span-3">
          <Panel className="h-full flex flex-col min-h-0">
            <PanelHeader right={<Users size={14} className="opacity-60" />}>
              Players
            </PanelHeader>
            <div className="p-3 overflow-y-auto nice-scroll flex-1 min-h-0">
              <PlayerList
                players={room.players}
                selfId={selfId}
                hostId={room.hostId}
                variant="lobby"
                onKick={isHost ? handleKick : undefined}
                onMute={isHost ? handleMute : undefined}
              />
            </div>
          </Panel>
        </div>

        {/* Center — chat */}
        <div className="col-span-12 lg:col-span-6">
          <Panel className="h-[60vh] lg:h-full flex flex-col min-h-0">
            <PanelHeader right={<MessageSquare size={14} className="opacity-60" />}>
              Lobby chat
            </PanelHeader>
            <ChatPanel
              messages={room.chat}
              onSend={handleSend}
              disabled={room.players.find((p) => p.id === selfId)?.isMuted}
              selfName={user.name}
              placeholder="Say hi to the team…"
            />
          </Panel>
        </div>

        {/* Right — settings + start */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          <Panel className="flex-1 flex flex-col min-h-0">
            <PanelHeader right={<Sliders size={14} className="opacity-60" />}>
              Game settings
            </PanelHeader>
            <div className="p-4 overflow-y-auto nice-scroll">
              <SettingsPanel
                settings={room.settings}
                isHost={isHost}
                onChange={handleSettings}
              />
            </div>
          </Panel>

          <div className="panel p-3 flex flex-col gap-2">
            {isHost ? (
              <>
                <Button
                  variant="primary"
                  className="w-full justify-center"
                  onClick={handleStart}
                  disabled={!enoughPlayers}
                  title={enoughPlayers ? 'Start the game' : 'Need at least 4 players'}
                >
                  <Play size={14} />
                  <span>INITIATE MISSION</span>
                </Button>
                {!enoughPlayers && (
                  <div className="text-[11px] font-mono opacity-60 text-center">
                    waiting for {4 - room.players.length} more…
                  </div>
                )}
              </>
            ) : (
              <div className="font-mono text-xs opacity-70 text-center py-1">
                Waiting for host to start…
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
