import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, BadgeCheck } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

export function EjectionOverlay({ ejection, onDone }) {
  return (
    <AnimatePresence>
      {ejection && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={() => {
            // close after the eject animation finishes
            setTimeout(() => onDone?.(), 3500);
          }}
        >
          {/* starfield */}
          <div className="absolute inset-0 sky-roll opacity-80 pointer-events-none" />

          <motion.div
            className="relative flex flex-col items-center gap-4"
            initial={{ y: 0, x: 0, rotate: 0, scale: 1, opacity: 1 }}
            animate={{
              y: [-10, -40, -180, -480],
              x: [0, 20, -10, 30],
              rotate: [0, 25, -15, 90],
              scale: [1, 1, 0.85, 0.4],
              opacity: [1, 1, 0.85, 0],
            }}
            transition={{ duration: 2.8, ease: 'easeIn' }}
          >
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-red-500/30 blur-2xl" />
              <Avatar name={ejection.name} src={ejection.avatar} size={96} className="relative" />
            </div>
            <div className="font-display text-3xl font-bold uppercase tracking-widest text-cream-100 drop-shadow">
              {ejection.name}
            </div>
            <div className="font-mono text-sm text-cream-100/70">ejected into the void</div>
          </motion.div>

          <motion.div
            className="absolute bottom-10 left-0 right-0 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 0.5 }}
          >
            <div
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-md border-2 font-display text-xl uppercase tracking-widest
                ${ejection.wasImposter
                  ? 'border-red-500 text-red-400 bg-red-950/40'
                  : 'border-neon-cyan text-neon-cyan bg-cyan-950/40'}`}
            >
              {ejection.wasImposter
                ? <><AlertOctagon size={18} /> {ejection.name} WAS the imposter</>
                : <><BadgeCheck size={18} /> {ejection.name} was NOT the imposter</>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function NoEjectionOverlay({ open, onDone }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={() => setTimeout(() => onDone?.(), 1800)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
            className="font-display text-3xl sm:text-5xl uppercase tracking-widest text-cream-100"
          >
            No one was ejected
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
