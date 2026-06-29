import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set, get) => ({
      name: '',
      avatar: null,        // url string or null
      email: null,         // email from Google
      provider: null,      // 'google' | 'guest'
      token: null,         // JWT token
      setIdentity: ({ name, avatar, provider, email, token }) =>
        set({
          name,
          avatar: avatar || null,
          email: email || null,
          provider: provider || 'guest',
          token: token || get().token,
        }),
      setToken: (token) => set({ token }),
      logout: () => set({
        name: '',
        avatar: null,
        email: null,
        provider: null,
        token: null,
      }),
      clear: () => set({
        name: '',
        avatar: null,
        email: null,
        provider: null,
        token: null,
      }),
    }),
    { name: 'auc:user' }
  )
);

// non-persisted room state — comes from socket events
export const useRoomStore = create((set) => ({
  room: null,
  result: null,
  banner: null,        // { kind: 'kicked'|'info'|'error', text }
  setRoom: (room) => set({ room }),
  setResult: (result) => set({ result }),
  setBanner: (banner) => set({ banner }),
  reset: () => set({ room: null, result: null, banner: null }),
}));
