import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_SERVER_URL || 'https://amongus-w0vw.onrender.com';

export const socket = io(URL, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
});
