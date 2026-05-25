import { Modal } from '../ui/Modal';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Volume2, VolumeX, Music, Music2, Sparkles, Keyboard } from 'lucide-react';

export function SettingsModal({ open, onClose }) {
  const { theme, toggleTheme, prefs, updatePrefs } = useTheme();

  return (
    <Modal open={open} onClose={onClose} title="Settings" size="md">
      <div className="space-y-3">
        <Section label="Appearance">
          <Row
            icon={theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            title="Theme"
            desc="Switch between light cream and cyber-dark."
            right={
              <button onClick={toggleTheme} className="btn btn-sm">
                {theme === 'dark' ? 'Dark' : 'Light'}
              </button>
            }
          />
          <Row
            icon={<Sparkles size={16} />}
            title="Animation effects"
            desc="UI motion + animated background."
            right={<Toggle on={prefs.animations} onChange={(v) => updatePrefs({ animations: v })} />}
          />
        </Section>

        <Section label="Audio">
          <Row
            icon={prefs.sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
            title="Sound effects"
            desc="UI clicks and notifications."
            right={<Toggle on={prefs.sound} onChange={(v) => updatePrefs({ sound: v })} />}
          />
          <Row
            icon={prefs.music ? <Music size={16} /> : <Music2 size={16} />}
            title="Background music"
            desc="Subtle ambient music in menus."
            right={<Toggle on={prefs.music} onChange={(v) => updatePrefs({ music: v })} />}
          />
        </Section>

        <Section label="Help">
          <Row
            icon={<Keyboard size={16} />}
            title="Keyboard shortcuts"
            desc={
              <span className="font-mono">
                <kbd className="kbd">Ctrl</kbd>+<kbd className="kbd">Enter</kbd> request run ·{' '}
                <kbd className="kbd">M</kbd> call meeting ·{' '}
                <kbd className="kbd">Esc</kbd> close modal
              </span>
            }
          />
        </Section>
      </div>

      <style>{`
        .kbd {
          display: inline-block;
          padding: 0 6px;
          margin: 0 2px;
          border: 1px solid currentColor;
          border-bottom-width: 2px;
          border-radius: 4px;
          font-family: inherit;
          font-size: 11px;
          line-height: 18px;
          opacity: 0.8;
        }
      `}</style>
    </Modal>
  );
}

function Section({ label, children }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest font-mono text-ink-700 dark:text-cream-100/60 mb-2">
        {label}
      </div>
      <div className="rounded-md border border-ink-900/50 dark:border-terminal-500 divide-y divide-ink-900/20 dark:divide-terminal-500/60 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Row({ icon, title, desc, right }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5">
      <div className="flex items-start gap-2.5 min-w-0">
        <div className="mt-0.5 text-ink-700 dark:text-cream-100/70">{icon}</div>
        <div className="min-w-0">
          <div className="text-sm font-medium font-mono">{title}</div>
          <div className="text-[11px] text-ink-700/80 dark:text-cream-100/50 font-mono">{desc}</div>
        </div>
      </div>
      {right}
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative w-10 h-5 rounded-full border border-ink-900 dark:border-terminal-500 transition ${
        on ? 'bg-neon-orange' : 'bg-cream-100 dark:bg-terminal-700'
      }`}
      aria-pressed={on}
    >
      <span
        className={`absolute top-0.5 ${on ? 'left-5' : 'left-0.5'} w-4 h-4 rounded-full bg-ink-900 transition-all`}
      />
    </button>
  );
}
