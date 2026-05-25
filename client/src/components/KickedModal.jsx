import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ShieldAlert } from 'lucide-react';

export function KickedModal({ open, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Removed from room"
      size="sm"
      footer={<Button variant="primary" onClick={onClose}>Back to menu</Button>}
    >
      <div className="flex items-start gap-3 font-mono text-sm">
        <div className="mt-0.5 text-red-500"><ShieldAlert size={20} /></div>
        <div>
          <p>You have been removed from the room by the host.</p>
          <p className="text-[12px] opacity-60 mt-2">
            You can browse for another room or create your own.
          </p>
        </div>
      </div>
    </Modal>
  );
}
