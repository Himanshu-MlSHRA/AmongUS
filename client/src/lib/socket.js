import { io } from 'socket.io-client';

// Falls back to localhost for local development
const URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const socket = io(URL, {
  // polling first → websocket upgrade is the correct Socket.IO handshake order
  transports: ['polling', 'websocket'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
  withCredentials: true,
});
