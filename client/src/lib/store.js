import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set) => ({
      name: '',
      avatar: null,        // url string or null
      provider: null,      // 'google' | 'github' | 'apple' | 'guest'
      setIdentity: ({ name, avatar, provider }) =>
        set({ name, avatar, provider: provider || 'guest' }),
      clear: () => set({ name: '', avatar: null, provider: null }),
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
