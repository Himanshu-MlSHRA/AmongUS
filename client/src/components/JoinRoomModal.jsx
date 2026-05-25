import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function JoinRoomModal({ open, onClose, onConfirm, busy, error }) {
  const [code, setCode] = useState('');
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (open) { setCode(''); setLocalError(null); }
  }, [open]);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!/^[A-Z0-9]{4}$/i.test(trimmed)) {
      setLocalError('Room code is 4 letters/numbers (e.g. K3PT).');
      return;
    }
    setLocalError(null);
    onConfirm?.(trimmed.toUpperCase());
  }

  return (
    <Modal
      open={open}
      onClose={busy ? undefined : onClose}
      title="Join a Room"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={busy}>
            {busy ? 'Joining…' : 'Join'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Room code"
          placeholder="K3PT"
          value={code}
          // do NOT force uppercase in display — normalize only on submit
          onChange={(e) => setCode(e.target.value.replace(/\s/g, '').slice(0, 4))}
          autoFocus
          maxLength={4}
          hint="Ask the host for their 4-character code."
          error={localError || error}
        />
      </form>
    </Modal>
  );
}
