import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Play, AlertOctagon, Bell, Sun, Moon, ArrowLeft, Users, Code2, BadgeCheck,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Panel, PanelHeader } from '../ui/Panel';
import { CodeEditor } from '../components/CodeEditor';
import { Terminal } from '../components/Terminal';
import { ProblemPanel } from '../components/ProblemPanel';
import { PlayerList } from '../components/PlayerList';
import { MeetingPanel } from '../components/MeetingPanel';
import { GameTimer } from '../components/GameTimer';
import { EjectionOverlay, NoEjectionOverlay } from '../components/EjectionOverlay';
import { EndScreen } from '../components/EndScreen';
import { useRoomStore, useUserStore } from '../lib/store';
import { socket } from '../lib/socket';
import { useTheme } from '../context/ThemeContext';

export function Game({ onLeave }) {
  const room = useRoomStore((s) => s.room);
  const result = useRoomStore((s) => s.result);
  const setBanner = useRoomStore((s) => s.setBanner);
  const user = useUserStore();
  const { theme, toggleTheme } = useTheme();

  const selfId = useMemo(() => socket.id, [room?.code]);
  const [pendingTargetId, setPendingTargetId] = useState(null);
  const [ejection, setEjection] = useState(null);
  const [noEject, setNoEject] = useState(false);
  const [meetingCdNow, setMeetingCdNow] = useState(Date.now());

  // Local source mirror
  const [source, setSource] = useState(room?.source || '');
  const lastIncoming = useRef(room?.source || '');

  useEffect(() => {
    if (!room) return;
    if (room.source !== lastIncoming.current && room.source !== source) {
      lastIncoming.current = room.source;
      setSource(room.source);
    }
  }, [room?.source]);

  useEffect(() => {
    if (!room) return;
    const onCodeUpdate = ({ source, byId }) => {
      if (byId === selfId) return;
      lastIncoming.current = source;
      setSource(source);
    };
    socket.on('code:update', onCodeUpdate);
    return () => socket.off('code:update', onCodeUpdate);
  }, [room?.code, selfId]);

  // listen for meeting result -> trigger ejection animation
  useEffect(() => {
    function onMeetingResult({ ejected }) {
      setPendingTargetId(null);
      if (ejected) setEjection(ejected);
      else setNoEject(true);
    }
    socket.on('meeting:result', onMeetingResult);
    return () => socket.off('meeting:result', onMeetingResult);
  }, []);

  // tick for cooldown countdown on meeting button
  useEffect(() => {
    if (!room || room.state !== 'playing') return;
    const id = setInterval(() => setMeetingCdNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [room?.state]);

  // clear pending vote when meeting ends/phase flips
  useEffect(() => {
    if (room?.state !== 'meeting') {
      setPendingTargetId(null);
    }
  }, [room?.state, room?.meeting?.phase]);

  if (!room) {
    return <div className="min-h-screen flex items-center justify-center font-mono opacity-60">Loading game…</div>;
  }

  const self = room.players.find((p) => p.id === selfId);
  const inMeeting = room.state === 'meeting';
  const ended = room.state === 'ended';
  const readOnly = inMeeting || ended || !self?.isAlive;
  const meetingPhase = room.meeting?.phase;
  const isVotingPhase = meetingPhase === 'voting';
  const myVote = inMeeting ? room.meeting?.votes?.[selfId] : undefined;
  const hasVoted = myVote != null;

  function handleSourceChange(v) {
    setSource(v);
    socket.emit('code:update', { source: v });
  }

  function requestRun() {
    if (room.runRequest) {
      socket.emit('run:approve');
    } else {
      socket.emit('run:request');
    }
  }

  const cdRemainingMs =
    (room.lastMeetingAt || 0) + (room.settings.meetingCooldown || 0) * 1000 - meetingCdNow;
  const meetingOnCd = cdRemainingMs > 0 && room.state === 'playing';
  const meetingDisabled = inMeeting || ended || !self?.isAlive || meetingOnCd;

  function callMeeting() {
    if (meetingDisabled) return;
    socket.emit('meeting:call', null, (res) => {
      if (res?.error) setBanner({ kind: 'error', text: res.error });
    });
  }

  function selectVote(targetId) {
    if (!isVotingPhase || hasVoted) return;
    setPendingTargetId(targetId);
  }
  function confirmVote(targetId) {
    socket.emit('vote:cast', { targetId });
    setPendingTargetId(null);
  }
  function cancelVote() {
    setPendingTargetId(null);
  }
  function selectSkip() {
    if (!isVotingPhase || hasVoted) return;
    setPendingTargetId('skip');
  }

  function handleSend(text) {
    socket.emit('chat:send', { text });
  }

  function leave() {
    socket.emit('room:leave');
    onLeave?.();
  }

  function playAgain() {
    socket.emit('game:playAgain', null, (res) => {
      if (res?.error) setBanner({ kind: 'error', text: res.error });
    });
  }

  // keyboard: ctrl+enter run, M meeting
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!inMeeting && !ended) requestRun();
      }
      if (
        !inMeeting && !ended &&
        (e.key === 'm' || e.key === 'M') &&
        !e.target.closest('input,textarea,.monaco-editor')
      ) {
        callMeeting();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inMeeting, ended, room?.runRequest, meetingDisabled]);

  const aliveCount = room.players.filter((p) => p.isAlive).length;
  const approvalsNeeded = Math.ceil(aliveCount / 2);
  const approvalCount = room.runRequest?.approvals?.length || 0;
  const caller = inMeeting ? room.players.find((p) => p.id === room.meeting?.calledById) : null;

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 dark:bg-terminal-900 text-ink-900 dark:text-cream-100">
      {/* Top bar */}
      <header className="px-4 sm:px-6 py-2.5 border-b border-ink-900/30 dark:border-terminal-500 flex items-center justify-between gap-3 bg-cream-50 dark:bg-terminal-800">
        <div className="flex items-center gap-3">
          <button onClick={leave} className="btn btn-sm">
            <ArrowLeft size={14} /> Leave
          </button>
          <div className="hidden sm:flex items-center gap-2 label-chip !py-1 !px-2 text-[11px]">
            {self?.isImposter ? (
              <><AlertOctagon size={12} className="text-red-500" /> imposter</>
            ) : (
              <><BadgeCheck size={12} className="text-neon-green" /> crewmate</>
            )}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center gap-3">
          {!ended && room.codingEndsAt && (
            <GameTimer endsAt={room.codingEndsAt} label="CODE TIME" />
          )}
          <div className="hidden md:block font-mono text-[11px] tracking-widest uppercase opacity-70 truncate">
            {ended
              ? <span className="text-neon-orange">{room.winner === 'crew' ? 'CREW WINS' : 'IMPOSTERS WIN'}</span>
              : inMeeting
                ? <span className="text-neon-cyan">EMERGENCY MEETING</span>
                : room.runRequest
                  ? <span className="text-neon-amber">RUN PENDING — {approvalCount}/{approvalsNeeded}</span>
                  : <span>SYSTEM ONLINE — ship the function</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="btn btn-sm btn-ghost" title="Theme">
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </header>

      {/* Body grid */}
      <div className="flex-1 grid grid-cols-12 gap-3 p-3 min-h-0">
        {/* Left — players */}
        <div className="col-span-12 lg:col-span-2">
          <Panel className="h-full flex flex-col min-h-0">
            <PanelHeader right={<Users size={12} className="opacity-60" />}>
              {inMeeting ? (isVotingPhase ? 'Vote' : 'Crew') : 'Crew'}
            </PanelHeader>
            <div className="p-2 overflow-y-auto nice-scroll flex-1 min-h-0">
              <PlayerList
                players={room.players}
                selfId={selfId}
                hostId={room.hostId}
                variant={inMeeting ? 'meeting' : 'game'}
                meetingVotes={inMeeting ? room.meeting?.votes : undefined}
                onSelect={inMeeting && self?.isAlive ? selectVote : undefined}
                pendingTargetId={pendingTargetId}
                onConfirmVote={confirmVote}
                onCancelVote={cancelVote}
                votingDisabled={inMeeting && !isVotingPhase}
              />
              {inMeeting && self?.isAlive && (
                <div className="mt-2">
                  {pendingTargetId === 'skip' ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={cancelVote}
                        className="btn btn-sm flex-1"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => confirmVote('skip')}
                        className="btn btn-sm btn-primary flex-1 animate-pulse"
                      >
                        Confirm skip ✓
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={selectSkip}
                      disabled={!isVotingPhase || hasVoted}
                      className={`btn btn-sm w-full ${myVote === 'skip' ? 'btn-primary' : ''}`}
                    >
                      {hasVoted
                        ? (myVote === 'skip' ? 'Skipped ✓' : 'Vote locked')
                        : isVotingPhase
                          ? 'Skip vote'
                          : 'Voting locked — discuss first'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </Panel>
        </div>

        {/* Center — editor + terminal OR meeting overlay */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-3 min-h-0">
          {inMeeting ? (
            <Panel className="flex-1 flex flex-col min-h-0 !p-0 overflow-hidden">
              <MeetingPanel
                meeting={room.meeting}
                chat={room.chat}
                onSend={handleSend}
                selfName={user.name}
                selfMuted={self?.isMuted}
                selfAlive={self?.isAlive}
                caller={caller}
                hint={
                  isVotingPhase
                    ? (hasVoted
                        ? 'Vote locked in. Waiting for others…'
                        : 'Click a crewmate, then press ✓ to confirm.')
                    : 'Discussion phase — voting is disabled until the timer ends.'
                }
              />
            </Panel>
          ) : (
            <>
              <Panel className="flex-1 flex flex-col min-h-0">
                <div className="px-3 py-1.5 border-b border-ink-900/30 dark:border-terminal-500 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 size={14} className="opacity-60" />
                    <span className="font-mono text-[11px] uppercase tracking-widest opacity-70">
                      solution.js
                    </span>
                    <span className="label-chip !py-0.5 !px-1.5 text-[10px]">{room.language}</span>
                    {readOnly && (
                      <span className="label-chip !py-0.5 !px-1.5 text-[10px] text-red-500">read-only</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={requestRun}
                      disabled={readOnly}
                    >
                      <Play size={12} />
                      {room.runRequest ? 'Approve run' : 'Request run'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={callMeeting}
                      disabled={meetingDisabled}
                      title={
                        meetingOnCd
                          ? `Cooldown: ${Math.ceil(cdRemainingMs / 1000)}s`
                          : 'Call emergency meeting'
                      }
                    >
                      <Bell size={12} />
                      {meetingOnCd
                        ? `Meeting (${Math.ceil(cdRemainingMs / 1000)}s)`
                        : 'Meeting'}
                    </Button>
                  </div>
                </div>
                <div className="flex-1 min-h-[280px]">
                  <CodeEditor value={source} onChange={handleSourceChange} readOnly={readOnly} />
                </div>
              </Panel>

              <Panel className="h-48 flex flex-col min-h-0 !p-0 overflow-hidden">
                <Terminal result={result} runRequest={room.runRequest} />
              </Panel>
            </>
          )}
        </div>

        {/* Right — problem only. Chat is intentionally disabled mid-game;
             it appears only in the lobby (pre-game) and during meetings. */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-3 min-h-0">
          <Panel className="flex-1 flex flex-col min-h-0">
            <ProblemPanel problem={room.problem} lives={room.lives} totalLives={3} />
          </Panel>
          {!inMeeting && !ended && (
            <div className="panel p-2.5 flex items-center gap-2 font-mono text-[11px] opacity-70">
              <MessageSquareOff size={14} className="opacity-70" />
              <span>chat is locked — call a meeting to talk</span>
            </div>
          )}
        </div>
      </div>

      {/* Ejection animation */}
      <EjectionOverlay ejection={ejection} onDone={() => setEjection(null)} />
      <NoEjectionOverlay open={noEject} onDone={() => setNoEject(false)} />

      {/* End-of-game screen */}
      <EndScreen
        open={ended && !ejection && !noEject}
        room={room}
        selfId={selfId}
        onPlayAgain={playAgain}
        onQuit={leave}
      />
    </div>
  );
}
