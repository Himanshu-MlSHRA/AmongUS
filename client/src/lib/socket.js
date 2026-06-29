import { io } from 'socket.io-client';
import { useUserStore } from './store';

const URL = import.meta.env.VITE_SERVER_URL || 'https://amongus-w0vw.onrender.com';

// Pull the persisted token (if any) to authenticate the socket connection
function getAuthToken() {
  try {
    const raw = localStorage.getItem('auc:user');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.state?.token || null;
    }
  } catch { /* ignore */ }
  return null;
}

export const socket = io(URL, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
  auth: {
    token: getAuthToken(),
  },
});

// Reconnect with fresh token after login
export function reconnectWithToken(token) {
  socket.auth = { token };
  socket.disconnect().connect();
}
