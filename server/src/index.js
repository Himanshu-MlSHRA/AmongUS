import 'dotenv/config';
import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { authRouter, verifyToken } from './auth.js';
import {
  createRoom, getRoom, listPublicRooms, listAllRooms, joinRoom, leaveRoom,
  kickPlayer, mutePlayer, updateSettings, appendChat, startGame, playAgain,
  setSource, requestRun, approveRun, clearRun, recordRunResult, timeOutGame,
  callMeeting, startVotingPhase, castVote, resolveMeeting, publicRoom, isKicked,
} from './rooms.js';
import { runUserCode } from './executor.js';

const PORT = process.env.PORT || 3001;
const ORIGIN = [
  "http://localhost:5173",
  "https://amongusforcoder.vercel.app"
];

const app = express();
app.use(cors({ origin: ORIGIN }));
app.use(express.json());
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRouter);
app.get('/rooms', (_req, res) => res.json(listPublicRooms()));
app.get('/rooms/all', (_req, res) => res.json(listAllRooms()));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ORIGIN, methods: ['GET', 'POST'] },
});

// socketId -> { name, avatar, code }
const sessions = new Map();

function broadcastRoom(code) {
  const room = getRoom(code);
  if (!room) return;
  // emit a per-viewer payload so imposter info stays hidden
  for (const p of room.players) {
    io.to(p.id).emit('room:state', publicRoom(room, p.id));
  }
}

// Auto-identify authenticated users on socket connection via JWT
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      socket.authUser = {
        name: decoded.name,
        avatar: decoded.avatar,
        provider: decoded.provider,
        googleId: decoded.sub,
      };
    }
  }
  next();
});

io.on('connection', (socket) => {
  // If the socket authenticated via JWT, pre-fill the session
  const authUser = socket.authUser;
  sessions.set(socket.id, {
    name: authUser?.name || null,
    avatar: authUser?.avatar || null,
    code: null,
  });

  socket.on('session:identify', ({ name, avatar }, ack) => {
    const s = sessions.get(socket.id);
    s.name = String(name || 'Anonymous').slice(0, 24).trim() || 'Anonymous';
    s.avatar = avatar || null;
    ack?.({ ok: true, id: socket.id, name: s.name, avatar: s.avatar });
  });

  socket.on('rooms:list', (_p, ack) => {
    ack?.(listPublicRooms());
  });

  socket.on('rooms:listAll', (_p, ack) => {
    ack?.(listAllRooms());
  });

  socket.on('room:create', ({ visibility }, ack) => {
    const s = sessions.get(socket.id);
    if (!s?.name) return ack?.({ error: 'Identify first.' });
    const room = createRoom({
      hostId: socket.id,
      hostName: s.name,
      hostAvatar: s.avatar,
      visibility,
    });
    s.code = room.code;
    socket.join(room.code);
    ack?.({ ok: true, code: room.code });
    broadcastRoom(room.code);
  });

  socket.on('room:join', ({ code }, ack) => {
    code = String(code || '').toUpperCase().trim();
    const s = sessions.get(socket.id);
    if (!s?.name) return ack?.({ error: 'Identify first.' });
    if (isKicked(code, socket.id) || isKicked(code, s.name)) {
      return ack?.({ error: 'You were removed from this room.' });
    }
    const r = joinRoom({
      code,
      player: { id: socket.id, name: s.name, avatar: s.avatar },
    });
    if (r.error) return ack?.({ error: r.error });
    s.code = code;
    socket.join(code);
    ack?.({ ok: true, code });
    broadcastRoom(code);
  });

  socket.on('room:leave', () => {
    const s = sessions.get(socket.id);
    if (!s?.code) return;
    const code = s.code;
    leaveRoom({ code, playerId: socket.id });
    socket.leave(code);
    s.code = null;
    broadcastRoom(code);
  });

  socket.on('room:settings', ({ settings }, ack) => {
    const s = sessions.get(socket.id);
    if (!s?.code) return;
    const r = updateSettings({ code: s.code, hostId: socket.id, settings });
    if (r.error) return ack?.({ error: r.error });
    ack?.({ ok: true });
    broadcastRoom(s.code);
  });

  socket.on('room:kick', ({ targetId }, ack) => {
    const s = sessions.get(socket.id);
    if (!s?.code) return;
    const r = kickPlayer({ code: s.code, hostId: socket.id, targetId });
    if (r.error) return ack?.({ error: r.error });
    io.to(targetId).emit('room:kicked', { code: s.code });
    const target = io.sockets.sockets.get(targetId);
    if (target) {
      target.leave(s.code);
      const ts = sessions.get(targetId);
      if (ts) ts.code = null;
    }
    ack?.({ ok: true });
    broadcastRoom(s.code);
  });

  socket.on('room:mute', ({ targetId }, ack) => {
    const s = sessions.get(socket.id);
    if (!s?.code) return;
    const r = mutePlayer({ code: s.code, hostId: socket.id, targetId });
    if (r.error) return ack?.({ error: r.error });
    ack?.({ ok: true });
    broadcastRoom(s.code);
  });

  socket.on('chat:send', ({ text }) => {
    const s = sessions.get(socket.id);
    if (!s?.code) return;
    const r = appendChat({ code: s.code, playerId: socket.id, text });
    if (r) broadcastRoom(s.code);
  });

  socket.on('game:start', (_p, ack) => {
    const s = sessions.get(socket.id);
    if (!s?.code) return;
    const r = startGame({ code: s.code, hostId: socket.id });
    if (r.error) return ack?.({ error: r.error });
    ack?.({ ok: true });
    broadcastRoom(s.code);
    scheduleCodingTimeout(s.code);
  });

  socket.on('game:playAgain', (_p, ack) => {
    const s = sessions.get(socket.id);
    if (!s?.code) return;
    const r = playAgain({ code: s.code, playerId: socket.id });
    if (r.error) return ack?.({ error: r.error });
    ack?.({ ok: true, allReady: r.allReady });
    broadcastRoom(s.code);
  });

  socket.on('code:update', ({ source }) => {
    const s = sessions.get(socket.id);
    if (!s?.code) return;
    const updated = setSource({ code: s.code, playerId: socket.id, source });
    if (updated) {
      // lighter event — don't echo full room for every keystroke
      socket.to(s.code).emit('code:update', { source, byId: socket.id });
    }
  });

  socket.on('run:request', (_p, ack) => {
    const s = sessions.get(socket.id);
    if (!s?.code) return;
    const r = requestRun({ code: s.code, playerId: socket.id });
    if (r.error) return ack?.({ error: r.error });
    ack?.({ ok: true });
    broadcastRoom(s.code);
  });

  socket.on('run:approve', (_p, ack) => {
    const s = sessions.get(socket.id);
    if (!s?.code) return;
    const r = approveRun({ code: s.code, playerId: socket.id });
    if (r.error) return ack?.({ error: r.error });
    ack?.({ ok: true });
    broadcastRoom(s.code);
    if (r.approved) executeForRoom(s.code);
  });

  socket.on('meeting:call', (_p, ack) => {
    const s = sessions.get(socket.id);
    if (!s?.code) return;
    const r = callMeeting({ code: s.code, playerId: socket.id });
    if (r.error) return ack?.({ error: r.error });
    ack?.({ ok: true });
    broadcastRoom(s.code);
    scheduleMeetingDiscussion(s.code);
  });

  socket.on('vote:cast', ({ targetId }, ack) => {
    const s = sessions.get(socket.id);
    if (!s?.code) return;
    const r = castVote({ code: s.code, voterId: socket.id, targetId });
    if (r.error) return ack?.({ error: r.error });
    ack?.({ ok: true });
    broadcastRoom(s.code);

    // resolve early if everyone alive has voted
    const room = getRoom(s.code);
    if (!room || !room.meeting) return;
    const aliveIds = room.players.filter((p) => p.isAlive).map((p) => p.id);
    if (aliveIds.every((id) => id in room.meeting.votes)) {
      finishMeeting(s.code);
    }
  });

  socket.on('disconnect', () => {
    const s = sessions.get(socket.id);
    if (s?.code) {
      leaveRoom({ code: s.code, playerId: socket.id });
      broadcastRoom(s.code);
    }
    sessions.delete(socket.id);
  });
});

function executeForRoom(code) {
  const room = getRoom(code);
  if (!room || !room.problem) return;
  const result = runUserCode({ code: room.source, tests: room.problem.tests });
  recordRunResult({ code, result });
  clearRun({ code });
  io.to(code).emit('run:result', result);
  broadcastRoom(code);
  if (room.state === 'ended') {
    cancelCodingTimeout(code);
    cancelMeetingTimer(code);
  }
}

const meetingTimers = new Map();
function cancelMeetingTimer(code) {
  if (meetingTimers.has(code)) {
    clearTimeout(meetingTimers.get(code));
    meetingTimers.delete(code);
  }
}

function scheduleMeetingDiscussion(code) {
  const room = getRoom(code);
  if (!room || !room.meeting || room.meeting.phase !== 'discussion') return;
  cancelMeetingTimer(code);
  const ms = Math.max(0, room.meeting.endsAt - Date.now());
  meetingTimers.set(code, setTimeout(() => {
    const v = startVotingPhase({ code });
    if (v) {
      io.to(code).emit('meeting:phase', { phase: 'voting' });
      broadcastRoom(code);
      scheduleMeetingResolution(code);
    }
  }, ms));
}

function scheduleMeetingResolution(code) {
  const room = getRoom(code);
  if (!room || !room.meeting) return;
  cancelMeetingTimer(code);
  const ms = Math.max(0, room.meeting.endsAt - Date.now());
  meetingTimers.set(code, setTimeout(() => finishMeeting(code), ms));
}

function finishMeeting(code) {
  cancelMeetingTimer(code);
  const r = resolveMeeting({ code });
  if (!r) return;
  io.to(code).emit('meeting:result', { ejected: r.ejected, winner: r.winner });
  broadcastRoom(code);
  if (r.winner) cancelCodingTimeout(code);
}

const codingTimers = new Map();
function cancelCodingTimeout(code) {
  if (codingTimers.has(code)) {
    clearTimeout(codingTimers.get(code));
    codingTimers.delete(code);
  }
}
function scheduleCodingTimeout(code) {
  const room = getRoom(code);
  if (!room || !room.codingEndsAt) return;
  cancelCodingTimeout(code);
  const ms = Math.max(0, room.codingEndsAt - Date.now());
  codingTimers.set(code, setTimeout(() => {
    const r = timeOutGame({ code });
    if (r) {
      io.to(code).emit('game:timeout');
      broadcastRoom(code);
    }
  }, ms));
}

server.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
