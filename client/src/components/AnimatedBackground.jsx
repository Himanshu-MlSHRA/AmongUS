import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

// Real brand logos via simple-icons CDN. Each request returns an SVG
// rendered in the requested hex (no `#` prefix).
// Reference: https://github.com/simple-icons/simple-icons
const LOGOS = [
  { slug: 'javascript', color: 'f7df1e', alt: 'JavaScript' },
  { slug: 'typescript', color: '3178c6', alt: 'TypeScript' },
  { slug: 'python',     color: '3776ab', alt: 'Python' },
  { slug: 'nodedotjs',         color: '5fa04e', alt: 'Node.js' },
  { slug: 'php',       color: 'ce422b', alt: 'Rust' },
  { slug: 'openjdk',    color: 'f89820', alt: 'Java' },
  { slug: 'cplusplus',  color: '00599c', alt: 'C++' },
  { slug: 'ruby',       color: 'cc342d', alt: 'Ruby' },
  { slug: 'html5',      color: 'e34c26', alt: 'HTML5' },
  { slug: 'css',       color: '1572b6', alt: 'CSS3' },
  { slug: 'react',      color: '61dafb', alt: 'React' },
  { slug: 'go',  color: '00add8', alt: 'Go' },
];

// Stable seeded positions so SSR/render order doesn't reshuffle them.
const SEEDS = [
  { top:  '10%', left:  '6%', size: 56, dur: 14, delay: 0,   drift: -18, rot: -6 },
  { top:  '22%', left: '82%', size: 44, dur: 17, delay: 1.2, drift:  22, rot:  4 },
  { top:  '36%', left: '14%', size: 38, dur: 13, delay: 0.6, drift: -14, rot:  8 },
  { top:  '52%', left: '88%', size: 52, dur: 19, delay: 2.0, drift:  18, rot: -3 },
  { top:  '66%', left: '20%', size: 40, dur: 15, delay: 1.6, drift: -22, rot:  6 },
  { top:  '78%', left: '74%', size: 46, dur: 16, delay: 0.4, drift:  16, rot: -8 },
  { top:  '30%', left: '46%', size: 32, dur: 12, delay: 2.4, drift: -10, rot:  3 },
  { top:  '60%', left: '54%', size: 36, dur: 18, delay: 0.9, drift:  20, rot: -5 },
  { top:  '14%', left: '38%', size: 30, dur: 13, delay: 1.8, drift: -16, rot:  7 },
  { top:  '84%', left: '42%', size: 32, dur: 16, delay: 0.2, drift:  14, rot: -2 },
  { top:  '46%', left: '30%', size: 28, dur: 14, delay: 2.6, drift:  12, rot:  5 },
  { top:  '58%', left: '66%', size: 30, dur: 17, delay: 1.4, drift: -20, rot: -4 },
];

export function AnimatedBackground() {
  const { prefs } = useTheme();
  const animate = prefs.animations !== false;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-animated">
      <div className="absolute inset-0 pixel-grid opacity-50" />
      <div className="sky-roll" />

      {/* Floating language logos */}
      {SEEDS.map((s, i) => {
        const lang = LOGOS[i % LOGOS.length];
        const Tag = animate ? motion.div : 'div';
        const motionProps = animate
          ? {
              initial: { y: 0, x: 0, rotate: s.rot },
              animate: {
                y: [0, s.drift, 0],
                x: [0, s.drift / 3, 0],
                rotate: [s.rot, s.rot + 4, s.rot],
              },
              transition: {
                duration: s.dur,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: s.delay,
              },
            }
          : {};
        return (
          <Tag
            key={i}
            className="absolute select-none pointer-events-none opacity-80 dark:opacity-75 drop-shadow-[2px_2px_0_rgba(0,0,0,0.45)]"
            style={{ top: s.top, left: s.left }}
            {...motionProps}
          >
            <img
              src={`https://cdn.simpleicons.org/${lang.slug}/${lang.color}`}
              alt={lang.alt}
              width={s.size}
              height={s.size}
              loading="lazy"
              draggable="false"
              style={{ width: s.size, height: s.size, display: 'block' }}
            />
          </Tag>
        );
      })}

      {/* Distant mountain silhouette for the "japanese game" vibe */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full opacity-60 dark:opacity-50"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          d="M0,256L80,234.7C160,213,320,171,480,165.3C640,160,800,192,960,213.3C1120,235,1280,245,1360,250.7L1440,256L1440,320L0,320Z"
          className="fill-ink-900/20 dark:fill-neon-orange/10"
        />
        <path
          d="M0,288L120,272C240,256,480,224,720,224C960,224,1200,256,1320,272L1440,288L1440,320L0,320Z"
          className="fill-ink-900/30 dark:fill-terminal-700"
        />
      </svg>

      {/* dark scanlines overlay */}
      <div className="absolute inset-0 scanlines hidden dark:block" />
    </div>
  );
}
