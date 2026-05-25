import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useUserStore } from '../lib/store';

// Pretend OAuth — for the prototype, we just pick a nickname and a provider tag.
// In production, swap these handlers for real OAuth redirects.
export function AuthModal({ open, onClose }) {
  const setIdentity = useUserStore((s) => s.setIdentity);
  const existingName = useUserStore((s) => s.name);
  const [nickname, setNickname] = useState(existingName || '');
  const [busy, setBusy] = useState(null);

  function fakeSignIn(provider) {
    if (busy) return;
    setBusy(provider);
    const name = nickname.trim() || randomName(provider);
    // simulate a tiny delay so the loading state is visible
    setTimeout(() => {
      setIdentity({ name, avatar: null, provider });
      setBusy(null);
      onClose?.();
    }, 500);
  }

  function continueAsGuest() {
    const name = nickname.trim();
    if (!name) return;
    setIdentity({ name, avatar: null, provider: 'guest' });
    onClose?.();
  }

  return (
    <Modal open={open} onClose={onClose} title="Sign in" size="md">
      <p className="text-sm text-ink-700 dark:text-cream-100/70 font-mono mb-4">
        Sign in to save your nickname, stats, and friends. You can also play as a guest.
      </p>

      <Input
        label="Display name"
        placeholder="HackerOne"
        value={nickname}
        onChange={(e) => setNickname(e.target.value.slice(0, 20))}
      />

      <div className="grid grid-cols-1 gap-2 mt-4">
        <ProviderButton
          label="Continue with Google"
          icon={<GoogleGlyph />}
          onClick={() => fakeSignIn('google')}
          busy={busy === 'google'}
        />
        <ProviderButton
          label="Continue with GitHub"
          icon={<GithubGlyph />}
          onClick={() => fakeSignIn('github')}
          busy={busy === 'github'}
        />
        <ProviderButton
          label="Continue with Apple"
          icon={<AppleGlyph />}
          onClick={() => fakeSignIn('apple')}
          busy={busy === 'apple'}
        />
      </div>

      <div className="my-4 flex items-center gap-2">
        <div className="flex-1 h-px bg-ink-900/20 dark:bg-terminal-500" />
        <span className="text-[11px] uppercase tracking-widest text-ink-700 dark:text-cream-100/60 font-mono">
          or
        </span>
        <div className="flex-1 h-px bg-ink-900/20 dark:bg-terminal-500" />
      </div>

      <Button
        variant="primary"
        className="w-full"
        onClick={continueAsGuest}
        disabled={!nickname.trim()}
      >
        Play as guest
      </Button>
    </Modal>
  );
}

function ProviderButton({ label, icon, onClick, busy }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="btn w-full justify-start gap-3 disabled:opacity-60"
    >
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      <span>{busy ? 'Signing in…' : label}</span>
    </button>
  );
}

function randomName(provider) {
  const seed = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  const tag = provider === 'github' ? 'gh' : provider === 'google' ? 'g' : 'a';
  return `coder_${tag}${seed}`;
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path fill="#EA4335" d="M12 10.2v3.95h5.5c-.24 1.4-1.65 4.1-5.5 4.1-3.3 0-6-2.74-6-6.1s2.7-6.1 6-6.1c1.88 0 3.13.8 3.85 1.5l2.62-2.55C16.7 3.5 14.55 2.5 12 2.5 6.78 2.5 2.5 6.78 2.5 12s4.28 9.5 9.5 9.5c5.48 0 9.1-3.85 9.1-9.27 0-.62-.07-1.1-.16-1.53H12z"/>
    </svg>
  );
}
function GithubGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.55 0-.27-.01-1-.02-1.96-3.2.7-3.87-1.54-3.87-1.54-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.73-1.53-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.17.91-.25 1.89-.38 2.86-.38.97 0 1.95.13 2.86.38 2.18-1.48 3.14-1.17 3.14-1.17.62 1.59.23 2.76.11 3.05.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.36.78 1.06.78 2.13 0 1.54-.01 2.78-.01 3.16 0 .31.21.66.8.55C20.21 21.39 23.5 17.07 23.5 12c0-6.35-5.15-11.5-11.5-11.5z"/>
    </svg>
  );
}
function AppleGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M16.37 1.43c0 1.14-.46 2.27-1.21 3.08-.79.85-2.05 1.5-3.07 1.42-.13-1.12.46-2.28 1.18-3.04C14.13 2 15.36 1.4 16.37 1.43zM20.5 17.4c-.55 1.27-.81 1.83-1.51 2.95-.98 1.55-2.36 3.49-4.07 3.5-1.52.02-1.92-.99-3.99-.98-2.07.01-2.5 1-4.03.98-1.71-.02-3.02-1.77-4-3.32C.5 15.6.04 10.94 1.61 8.46c1.13-1.79 2.92-2.84 4.6-2.84 1.71 0 2.79 1.04 4.21 1.04 1.39 0 2.23-1.04 4.22-1.04 1.5 0 3.09.81 4.22 2.21-3.71 2.03-3.11 7.34 1.64 9.57z"/>
    </svg>
  );
}
