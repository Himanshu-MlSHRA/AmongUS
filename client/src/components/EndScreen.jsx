import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Frown, Code2, ShieldAlert, BadgeCheck, RotateCcw, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';

export function EndScreen({
  open,
  room,
  selfId,
  onPlayAgain,
  onQuit,
}) {
  if (!room) return null;

  const self = room.players.find((p) => p.id === selfId);
  const crewWon = room.winner === 'crew';
  const selfWon = self
    ? (crewWon ? !self.isImposter : self.isImposter)
    : false;

  const myReady = !!self?.playAgain;
  const readyCount = room.players.filter((p) => p.playAgain).length;
  const totalCount = room.players.length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[55] flex items-center justify-center p-4 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* themed backdrop */}
          <div
            className={`absolute inset-0 ${selfWon
              ? 'bg-gradient-to-br from-emerald-900/95 via-slate-950/95 to-cyan-900/95'
              : 'bg-gradient-to-br from-red-950/95 via-slate-950/95 to-purple-950/95'}`}
          />
          {selfWon && <CodingConfettiLayer />}
          {!selfWon && <RainLayer />}

          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="relative w-full max-w-2xl panel p-0 overflow-hidden"
          >
            <div
              className={`px-6 py-5 border-b-2 ${selfWon
                ? 'border-neon-green bg-emerald-950/40'
                : 'border-red-500 bg-red-950/40'}`}
            >
              <div className="flex items-center gap-3">
                {selfWon ? (
                  <motion.div
                    initial={{ rotate: -20, scale: 0.5 }}
                    animate={{ rotate: [0, -10, 10, 0], scale: [0.5, 1.2, 1] }}
                    transition={{ duration: 0.9 }}
                    className="text-yellow-400"
                  >
                    <Trophy size={56} />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ y: -10, scale: 0.5 }}
                    animate={{ y: [0, 8, 0], scale: 1 }}
                    transition={{ duration: 1.4, repeat: Infinity, repeatType: 'mirror' }}
                    className="text-red-400"
                  >
                    <Frown size={56} />
                  </motion.div>
                )}
                <div>
                  <div className="font-display uppercase tracking-widest text-3xl sm:text-4xl text-cream-100">
                    {selfWon ? 'VICTORY' : 'DEFEAT'}
                  </div>
                  <div className="font-mono text-sm text-cream-100/70">
                    {crewWon
                      ? (selfWon
                        ? 'Crew shipped the function. Imposters are exposed.'
                        : 'The crew shipped the function — your sabotage failed.')
                      : (selfWon
                        ? 'Imposters won — sabotage successful.'
                        : 'Imposters outlasted the crew. The build never shipped.')}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="text-[11px] uppercase tracking-widest opacity-70 font-mono mb-2">
                Roles revealed
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {room.players.map((p) => (
                  <li
                    key={p.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border font-mono text-sm
                      ${p.isImposter
                        ? 'border-red-400 bg-red-950/30 text-red-300'
                        : 'border-emerald-400 bg-emerald-950/30 text-emerald-200'}`}
                  >
                    {p.isImposter
                      ? <ShieldAlert size={14} className="text-red-400" />
                      : <BadgeCheck size={14} className="text-emerald-400" />}
                    <span className="flex-1 truncate">{p.name}</span>
                    <span className="text-[11px] uppercase opacity-70">
                      {p.isImposter ? 'imposter' : 'crewmate'}
                    </span>
                    {p.playAgain && (
                      <span className="text-[10px] text-neon-cyan">ready</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-6 pb-5 pt-2 flex flex-col sm:flex-row gap-2 sm:items-center">
              <div className="text-[11px] font-mono opacity-70 flex-1">
                {myReady
                  ? `Waiting for others… ${readyCount}/${totalCount} ready`
                  : 'Choose to play again or head back home.'}
              </div>
              <div className="flex gap-2">
                <Button onClick={onQuit}>
                  <LogOut size={14} /> Quit
                </Button>
                <Button
                  variant="primary"
                  onClick={onPlayAgain}
                  disabled={myReady}
                >
                  <RotateCcw size={14} />
                  {myReady ? `Ready (${readyCount}/${totalCount})` : 'Play again'}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CodingConfettiLayer() {
  const tokens = ['{ }', '< />', '=>', '0x1F', 'fn()', '++', '||', '&&', '##', '0b1', 'ret', 'git'];
  const items = Array.from({ length: 22 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.2,
    dur: 3 + Math.random() * 2.5,
    text: tokens[i % tokens.length],
    rot: Math.random() * 60 - 30,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {items.map((t) => (
        <motion.div
          key={t.id}
          initial={{ y: -40, opacity: 0, rotate: t.rot }}
          animate={{ y: '110vh', opacity: [0, 1, 1, 0], rotate: t.rot + 180 }}
          transition={{ duration: t.dur, delay: t.delay, repeat: Infinity }}
          className="absolute font-mono text-base text-neon-green drop-shadow"
          style={{ left: `${t.left}%` }}
        >
          {t.text}
        </motion.div>
      ))}
      <Code2 className="absolute top-6 right-8 text-neon-green/30" size={120} />
    </div>
  );
}

function RainLayer() {
  const items = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.2,
    dur: 1.4 + Math.random() * 1.4,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {items.map((t) => (
        <motion.div
          key={t.id}
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: '110vh', opacity: [0, 0.8, 0] }}
          transition={{ duration: t.dur, delay: t.delay, repeat: Infinity }}
          className="absolute w-px h-10 bg-cyan-300/40"
          style={{ left: `${t.left}%` }}
        />
      ))}
    </div>
  );
}
