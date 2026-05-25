import { pickProblem } from './problems.js';

const rooms = new Map();          // roomCode -> Room
const kicked = new Map();         // roomCode -> Set<socketId or nickname>

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // unambiguous
function genCode() {
  let c;
  do {
    c = '';
    for (let i = 0; i < 4; i++) {
      c += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
  } while (rooms.has(c));
  return c;
}

function makePlayer({ id, name, avatar, isHost = false }) {
  return {
    id,
    name,
    avatar: avatar || null,
    isHost,
    isImposter: false,
    isAlive: true,
    isMuted: false,
    ready: false,
    suspicious: false,
    playAgain: false,
  };
}

export function createRoom({ hostId, hostName, hostAvatar, visibility }) {
  const code = genCode();
  const room = {
    code,
    hostId,
    visibility: visibility === 'public' ? 'public' : 'private',
    state: 'lobby',
    players: [makePlayer({ id: hostId, name: hostName, avatar: hostAvatar, isHost: true })],
    settings: {
      codingTimer: 600,
      discussionTimer: 25,
      votingTimer: 45,
      meetingCooldown: 25,
      maxPlayers: 10,
      imposterCount: 1,
    },
    chat: [],
    source: '',
    language: 'javascript',
    problem: null,
    lives: 3,
    runRequest: null,
    lastResult: null,
    meeting: null,
    winner: null,
    gameStartedAt: null,
    codingEndsAt: null,
    lastMeetingAt: null,
    lastEjection: null,
    createdAt: Date.now(),
  };
  rooms.set(code, room);
  return room;
}

export function getRoom(code) {
  return rooms.get(code);
}

function summarizeRoom(r) {
  const host = r.players.find((p) => p.isHost);
  return {
    code: r.code,
    visibility: r.visibility,
    state: r.state,
    players: r.players.length,
    maxPlayers: r.settings.maxPlayers,
    hostName: host?.name || '—',
    canJoin: r.state === 'lobby' && r.players.length < r.settings.maxPlayers,
  };
}

export function listPublicRooms() {
  return [...rooms.values()]
    .filter((r) => r.visibility === 'public' && r.state === 'lobby')
    .map(summarizeRoom);
}

export function listAllRooms() {
  return [...rooms.values()]
    .filter((r) => r.state === 'lobby' || r.state === 'playing' || r.state === 'meeting')
    .map(summarizeRoom);
}

export function joinRoom({ code, player }) {
  const room = rooms.get(code);
  if (!room) return { error: 'Room not found.' };
  if (isKicked(code, player.id) || isKicked(code, player.name)) {
    return { error: 'You were removed from this room.' };
  }
  if (room.state !== 'lobby') return { error: 'Game already started.' };
  if (room.players.length >= room.settings.maxPlayers) {
    return { error: 'Room is full.' };
  }
  if (room.players.find((p) => p.id === player.id)) {
    return { room };
  }
  room.players.push(makePlayer(player));
  return { room };
}

export function leaveRoom({ code, playerId }) {
  const room = rooms.get(code);
  if (!room) return null;
  room.players = room.players.filter((p) => p.id !== playerId);
  if (room.players.length === 0) {
    rooms.delete(code);
    kicked.delete(code);
    return null;
  }
  if (!room.players.find((p) => p.isHost)) {
    room.players[0].isHost = true;
    room.hostId = room.players[0].id;
  }
  return room;
}

export function kickPlayer({ code, hostId, targetId }) {
  const room = rooms.get(code);
  if (!room) return { error: 'No room.' };
  if (room.hostId !== hostId) return { error: 'Only host can kick.' };
  const target = room.players.find((p) => p.id === targetId);
  if (!target) return { error: 'Player not found.' };
  if (target.isHost) return { error: 'Cannot kick host.' };
  room.players = room.players.filter((p) => p.id !== targetId);
  if (!kicked.has(code)) kicked.set(code, new Set());
  kicked.get(code).add(targetId);
  kicked.get(code).add(target.name);
  return { room, targetId };
}

export function mutePlayer({ code, hostId, targetId }) {
  const room = rooms.get(code);
  if (!room) return { error: 'No room.' };
  if (room.hostId !== hostId) return { error: 'Only host can mute.' };
  const target = room.players.find((p) => p.id === targetId);
  if (!target) return { error: 'Player not found.' };
  target.isMuted = !target.isMuted;
  return { room };
}

export function isKicked(code, who) {
  return kicked.get(code)?.has(who) ?? false;
}

export function updateSettings({ code, hostId, settings }) {
  const room = rooms.get(code);
  if (!room) return { error: 'No room.' };
  if (room.hostId !== hostId) return { error: 'Only host can edit settings.' };
  const next = { ...room.settings };
  if (typeof settings.codingTimer === 'number') next.codingTimer = clamp(settings.codingTimer, 60, 1800);
  if (typeof settings.discussionTimer === 'number') next.discussionTimer = clamp(settings.discussionTimer, 10, 180);
  if (typeof settings.votingTimer === 'number') next.votingTimer = clamp(settings.votingTimer, 15, 180);
  if (typeof settings.meetingCooldown === 'number') next.meetingCooldown = clamp(settings.meetingCooldown, 0, 120);
  if (typeof settings.maxPlayers === 'number') next.maxPlayers = clamp(settings.maxPlayers, 4, 15);
  if (typeof settings.imposterCount === 'number') next.imposterCount = clamp(settings.imposterCount, 1, 3);
  room.settings = next;
  return { room };
}

export function appendChat({ code, playerId, text }) {
  const room = rooms.get(code);
  if (!room) return null;
  const p = room.players.find((x) => x.id === playerId);
  if (!p || p.isMuted) return null;
  const msg = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: p.name,
    avatar: p.avatar,
    text: String(text).slice(0, 500),
    ts: Date.now(),
  };
  room.chat.push(msg);
  if (room.chat.length > 200) room.chat.shift();
  return { room, msg };
}

export function startGame({ code, hostId }) {
  const room = rooms.get(code);
  if (!room) return { error: 'No room.' };
  if (room.hostId !== hostId) return { error: 'Only host can start.' };
  if (room.players.length < 4) return { error: 'Need at least 4 players.' };

  const ids = [...room.players.map((p) => p.id)];
  shuffle(ids);
  const imposterIds = new Set(ids.slice(0, room.settings.imposterCount));
  for (const p of room.players) {
    p.isImposter = imposterIds.has(p.id);
    p.isAlive = true;
    p.ready = false;
    p.suspicious = false;
    p.playAgain = false;
  }

  room.problem = pickProblem();
  room.source = room.problem.starter;
  room.lives = 3;
  room.state = 'playing';
  room.lastResult = null;
  room.runRequest = null;
  room.meeting = null;
  room.winner = null;
  room.gameStartedAt = Date.now();
  room.codingEndsAt = Date.now() + room.settings.codingTimer * 1000;
  room.lastMeetingAt = 0;
  room.lastEjection = null;
  return { room };
}

export function playAgain({ code, playerId }) {
  const room = rooms.get(code);
  if (!room) return { error: 'No room.' };
  if (room.state !== 'ended') return { error: 'Game not over.' };
  const p = room.players.find((x) => x.id === playerId);
  if (!p) return { error: 'Player not found.' };
  p.playAgain = true;

  // when every still-connected player wants to play again, reset to lobby
  const allReady = room.players.length >= 1 && room.players.every((x) => x.playAgain);
  if (allReady) {
    for (const x of room.players) {
      x.isImposter = false;
      x.isAlive = true;
      x.ready = false;
      x.suspicious = false;
      x.playAgain = false;
    }
    room.state = 'lobby';
    room.problem = null;
    room.source = '';
    room.lives = 3;
    room.lastResult = null;
    room.runRequest = null;
    room.meeting = null;
    room.winner = null;
    room.gameStartedAt = null;
    room.codingEndsAt = null;
    room.lastMeetingAt = 0;
    room.lastEjection = null;
  }
  return { room, allReady };
}

export function setSource({ code, playerId, source }) {
  const room = rooms.get(code);
  if (!room) return null;
  if (room.state !== 'playing') return null;
  const p = room.players.find((x) => x.id === playerId);
  if (!p || !p.isAlive) return null;
  room.source = source;
  return room;
}

export function requestRun({ code, playerId }) {
  const room = rooms.get(code);
  if (!room) return { error: 'No room.' };
  if (room.state !== 'playing') return { error: 'Not in play.' };
  room.runRequest = {
    byId: playerId,
    approvals: new Set([playerId]),
    requiredAt: Date.now(),
  };
  return { room };
}

export function approveRun({ code, playerId }) {
  const room = rooms.get(code);
  if (!room || !room.runRequest) return { error: 'No pending run.' };
  room.runRequest.approvals.add(playerId);
  const alive = room.players.filter((p) => p.isAlive).length;
  const need = Math.ceil(alive / 2);
  return { room, approved: room.runRequest.approvals.size >= need };
}

export function clearRun({ code }) {
  const room = rooms.get(code);
  if (!room) return null;
  room.runRequest = null;
  return room;
}

export function recordRunResult({ code, result }) {
  const room = rooms.get(code);
  if (!room) return null;
  room.lastResult = result;
  if (result.error || result.passed < result.total) {
    room.lives = Math.max(0, room.lives - 1);
  }
  if (result.passed === result.total && !result.error) {
    room.state = 'ended';
    room.winner = 'crew';
  } else if (room.lives <= 0) {
    room.state = 'ended';
    room.winner = 'imposters';
  }
  return room;
}

export function timeOutGame({ code }) {
  const room = rooms.get(code);
  if (!room) return null;
  if (room.state === 'ended' || room.state === 'lobby') return null;
  room.state = 'ended';
  room.winner = 'imposters';
  return room;
}

export function callMeeting({ code, playerId }) {
  const room = rooms.get(code);
  if (!room) return { error: 'No room.' };
  if (room.state !== 'playing') return { error: 'Cannot call right now.' };
  const p = room.players.find((x) => x.id === playerId);
  if (!p || !p.isAlive) return { error: 'You cannot call a meeting.' };
  const cdRemaining =
    (room.lastMeetingAt || 0) + room.settings.meetingCooldown * 1000 - Date.now();
  if (cdRemaining > 0) {
    return { error: `Meeting on cooldown — wait ${Math.ceil(cdRemaining / 1000)}s.` };
  }
  room.state = 'meeting';
  room.lastEjection = null;
  room.meeting = {
    calledById: playerId,
    phase: 'discussion',
    votes: {},
    endsAt: Date.now() + room.settings.discussionTimer * 1000,
  };
  return { room };
}

export function startVotingPhase({ code }) {
  const room = rooms.get(code);
  if (!room || !room.meeting) return null;
  if (room.meeting.phase !== 'discussion') return null;
  room.meeting.phase = 'voting';
  room.meeting.endsAt = Date.now() + room.settings.votingTimer * 1000;
  return { room };
}

export function castVote({ code, voterId, targetId }) {
  const room = rooms.get(code);
  if (!room || !room.meeting) return { error: 'No meeting.' };
  if (room.meeting.phase !== 'voting') {
    return { error: 'Discussion in progress — voting starts after the timer.' };
  }
  const voter = room.players.find((x) => x.id === voterId);
  if (!voter || !voter.isAlive) return { error: 'Cannot vote.' };
  room.meeting.votes[voterId] = targetId;
  return { room };
}

export function resolveMeeting({ code }) {
  const room = rooms.get(code);
  if (!room || !room.meeting) return null;
  const tally = {};
  for (const t of Object.values(room.meeting.votes)) {
    tally[t] = (tally[t] || 0) + 1;
  }
  let topId = null;
  let topVotes = 0;
  let tied = false;
  for (const [id, n] of Object.entries(tally)) {
    if (n > topVotes) { topId = id; topVotes = n; tied = false; }
    else if (n === topVotes) { tied = true; }
  }
  let ejected = null;
  if (topId && topId !== 'skip' && !tied) {
    const target = room.players.find((p) => p.id === topId);
    if (target) {
      target.isAlive = false;
      ejected = { id: target.id, name: target.name, avatar: target.avatar, wasImposter: target.isImposter };
    }
  }
  const aliveImposters = room.players.filter((p) => p.isAlive && p.isImposter).length;
  const aliveCrew = room.players.filter((p) => p.isAlive && !p.isImposter).length;
  let winner = null;
  if (aliveImposters === 0) winner = 'crew';
  else if (aliveImposters >= aliveCrew) winner = 'imposters';

  room.meeting = null;
  room.lastMeetingAt = Date.now();
  room.lastEjection = ejected;
  if (winner) {
    room.state = 'ended';
    room.winner = winner;
  } else {
    room.state = 'playing';
  }
  return { room, ejected, winner };
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

// Public-safe view of the room. Imposter identity hidden until game over.
export function publicRoom(room, viewerId) {
  if (!room) return null;
  return {
    code: room.code,
    hostId: room.hostId,
    visibility: room.visibility,
    state: room.state,
    settings: room.settings,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      isHost: p.isHost,
      isAlive: p.isAlive,
      isMuted: p.isMuted,
      ready: p.ready,
      suspicious: p.suspicious,
      playAgain: p.playAgain,
      isImposter:
        room.state === 'ended' || p.id === viewerId ? p.isImposter : undefined,
    })),
    chat: room.chat,
    source: room.source,
    language: room.language,
    problem: room.problem,
    lives: room.lives,
    runRequest: room.runRequest
      ? { byId: room.runRequest.byId, approvals: [...room.runRequest.approvals] }
      : null,
    lastResult: room.lastResult,
    meeting: room.meeting
      ? {
          calledById: room.meeting.calledById,
          phase: room.meeting.phase,
          votes: room.meeting.votes,
          endsAt: room.meeting.endsAt,
        }
      : null,
    winner: room.winner || null,
    gameStartedAt: room.gameStartedAt,
    codingEndsAt: room.codingEndsAt,
    lastMeetingAt: room.lastMeetingAt || 0,
    lastEjection: room.lastEjection || null,
  };
}
