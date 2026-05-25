# AmongUs for &lt;C&gt;oders

A real-time multiplayer social-deduction coding game. Players share a Monaco editor, solve a coding challenge as a team, and try to identify imposters who are secretly sabotaging the work.

## Quick start

```bash
# from D:\AmonUS — npm workspaces handle both server and client
npm install

# starts BOTH server (3001) and client (5173) together
npm run dev
```

Open `http://localhost:5173` in 4+ browser tabs to simulate players. One creates a room, others join with the 4-letter code.

> Want them separate? Use `npm run dev:server` or `npm run dev:client`.

## Project layout

```
AmonUS/
├── server/                    Node + Express + Socket.io
│   └── src/
│       ├── index.js           Socket gateway
│       ├── rooms.js           Room/player/game state
│       ├── executor.js        Sandboxed test runner (node:vm)
│       └── problems.js        Coding challenges
└── client/                    React + Vite + Tailwind + Monaco
    └── src/
        ├── App.jsx            Page router + global socket listeners
        ├── pages/
        │   ├── Landing.jsx    Main menu (full-screen, animated bg)
        │   ├── Lobby.jsx      Pre-game lobby
        │   └── Game.jsx       Game + meeting view
        ├── components/        AuthModal, SettingsModal, RoomHeader,
        │                      PlayerList, ChatPanel, SettingsPanel,
        │                      CodeEditor, Terminal, ProblemPanel,
        │                      KickedModal, AnimatedBackground, …
        ├── ui/                Button, Modal, Panel, Input, Avatar
        ├── context/           ThemeContext (light cream / dark cyber)
        └── lib/               socket.js, store.js (Zustand)
```

## What's in v0.1

- **Theme system** — light cream + dark cyber, toggled globally via `<html class="dark">`. All components are theme-aware.
- **Main menu** — full-screen animated background, Play Online / Join Room / Create Room, profile + settings.
- **Auth modal** — Google / GitHub / Apple buttons (mocked) + guest mode. Picks a nickname and stores locally.
- **Settings modal** — theme, sound, music, animations, keyboard hints.
- **Create Room flow** — public/private chooser → 4-char room code.
- **Lobby** — room header with copyable code, player list with host/kick/mute, lobby chat, host-editable game settings (visible to all, disabled for non-hosts), imposter count slider, INITIATE MISSION button (needs ≥4 players).
- **Game** — Monaco editor with live code sync, terminal output, problem panel with hint + lives, request-run + majority-approval to execute, emergency-meeting button.
- **Meeting** — read-only editor, vote panel on the left (click a player to vote), discussion chat on the right, automatic resolution when all alive players vote or timer expires.
- **Kick handling** — kicked players see a proper modal (no `alert()`), get blocked from re-joining the room.
- **Ctrl+Enter** to request a run, **M** for meeting.

## Game rules (current)

- 1–3 imposters chosen at random when host starts the game.
- 3 shared lives. Failing run = -1 life. 0 lives → imposters win.
- Solving all test cases → crew wins.
- Meetings: discuss + vote. Majority eject. Tie = no eject.
- If # imposters ≥ # crew alive → imposters win.

## Security note

The executor uses Node's built-in `vm` with a 1.5s timeout. **Not production-safe.** Run only with friends on localhost. For production, swap `server/src/executor.js` for a Docker-based runner.

## Tech stack

- **Frontend:** React 18, Vite, TailwindCSS, Zustand, Monaco Editor, Framer Motion, Lucide Icons, socket.io-client
- **Backend:** Node 20+, Express, Socket.io
- **Storage:** in-memory (prototype). Swap for Mongo + Redis in production.

## Env

```
# server/.env
PORT=3001
CLIENT_ORIGIN=http://localhost:5173

# client/.env
VITE_SERVER_URL=http://localhost:3001
```
