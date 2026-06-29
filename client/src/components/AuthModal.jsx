import { useState, useEffect, useCallback, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useUserStore } from '../lib/store';
import { socket, reconnectWithToken } from '../lib/socket';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://amongus-w0vw.onrender.com';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export function AuthModal({ open, onClose }) {
  const setIdentity = useUserStore((s) => s.setIdentity);
  const logout = useUserStore((s) => s.logout);
  const existingName = useUserStore((s) => s.name);
  const existingProvider = useUserStore((s) => s.provider);
  const existingAvatar = useUserStore((s) => s.avatar);
  const [nickname, setNickname] = useState(existingName || '');
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const googleBtnRef = useRef(null);
  const gsiInitializedRef = useRef(false);

  // Sync nickname when store updates (e.g. after Google login)
  useEffect(() => {
    if (existingName) setNickname(existingName);
  }, [existingName]);

  // Handle Google credential response
  const handleGoogleCredential = useCallback(async (response) => {
    if (!response?.credential) {
      setError('Google sign-in was cancelled.');
      setBusy(null);
      return;
    }

    setBusy('google');
    setError(null);

    try {
      // Send the Google ID token to our server for verification
      const res = await fetch(`${SERVER_URL}/auth/google/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      // Store the user identity + JWT token
      setIdentity({
        name: data.user.name,
        avatar: data.user.avatar,
        email: data.user.email,
        provider: 'google',
        token: data.token,
      });

      // Reconnect socket with the new auth token
      reconnectWithToken(data.token);

      // Identify on the socket
      socket.emit('session:identify', {
        name: data.user.name,
        avatar: data.user.avatar,
      });

      setBusy(null);
      onClose?.();
    } catch (err) {
      console.error('[auth] Google sign-in error:', err);
      setError(err.message || 'Sign-in failed. Please try again.');
      setBusy(null);
    }
  }, [setIdentity, onClose]);

  // Initialize Google Identity Services when modal opens
  useEffect(() => {
    if (!open || !GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.startsWith('REPLACE')) return;
    if (typeof window.google === 'undefined') return;

    // Small delay to ensure the DOM ref is mounted
    const timer = setTimeout(() => {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render the official Google button inside our container
        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            type: 'standard',
            theme: document.documentElement.classList.contains('dark') ? 'filled_black' : 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            width: googleBtnRef.current.offsetWidth || 340,
            logo_alignment: 'left',
          });
        }
        gsiInitializedRef.current = true;
      } catch (err) {
        console.error('[auth] GSI init error:', err);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [open, handleGoogleCredential]);

  function continueAsGuest() {
    const name = nickname.trim();
    if (!name) return;
    setIdentity({ name, avatar: null, provider: 'guest', email: null, token: null });
    socket.emit('session:identify', { name, avatar: null });
    onClose?.();
  }

  function handleLogout() {
    logout();
    // Revoke Google session if available
    if (window.google?.accounts?.id) {
      try { window.google.accounts.id.disableAutoSelect(); } catch { /* ok */ }
    }
    // Reconnect socket without auth
    reconnectWithToken(null);
    onClose?.();
  }

  const isLoggedIn = !!existingName && existingProvider === 'google';
  const googleNotConfigured = !GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.startsWith('REPLACE');

  return (
    <Modal open={open} onClose={onClose} title={isLoggedIn ? 'Profile' : 'Sign in'} size="md">
      {isLoggedIn ? (
        /* ─── Logged-in view ─── */
        <div className="text-center">
          {existingAvatar && (
            <img
              src={existingAvatar}
              alt={existingName}
              className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-neon-orange"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="text-lg font-display font-bold">{existingName}</div>
          <div className="text-xs font-mono opacity-60 mb-4">
            Signed in with Google
          </div>
          <Button
            variant="danger"
            className="w-full"
            onClick={handleLogout}
          >
            Sign out
          </Button>
        </div>
      ) : (
        /* ─── Sign-in view ─── */
        <>
          <p className="text-sm text-ink-700 dark:text-cream-100/70 font-mono mb-4">
            Sign in to save your nickname, stats, and friends. You can also play as a guest.
          </p>

          {/* Google Sign-In Button */}
          {googleNotConfigured ? (
            <div className="panel p-3 mb-3 text-center">
              <div className="text-xs font-mono text-neon-amber mb-1">⚠ Google OAuth not configured</div>
              <div className="text-[11px] font-mono opacity-60">
                Set VITE_GOOGLE_CLIENT_ID in client/.env and GOOGLE_CLIENT_ID in server/.env
              </div>
            </div>
          ) : (
            <div className="mb-3">
              <div
                ref={googleBtnRef}
                className="flex items-center justify-center min-h-[44px]"
              >
                {/* Google GSI button renders here */}
                {busy === 'google' && (
                  <div className="text-sm font-mono opacity-70 animate-pulse">
                    Signing in with Google…
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-3 text-sm font-mono text-red-500 text-center">
              {error}
            </div>
          )}

          <div className="my-4 flex items-center gap-2">
            <div className="flex-1 h-px bg-ink-900/20 dark:bg-terminal-500" />
            <span className="text-[11px] uppercase tracking-widest text-ink-700 dark:text-cream-100/60 font-mono">
              or play as guest
            </span>
            <div className="flex-1 h-px bg-ink-900/20 dark:bg-terminal-500" />
          </div>

          <Input
            label="Display name"
            placeholder="HackerOne"
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, 20))}
          />

          <Button
            variant="primary"
            className="w-full mt-3"
            onClick={continueAsGuest}
            disabled={!nickname.trim()}
          >
            Play as guest
          </Button>
        </>
      )}
    </Modal>
  );
}
