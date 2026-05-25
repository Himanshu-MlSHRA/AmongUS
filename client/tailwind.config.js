/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: [
          'JetBrains Mono', 'Fira Code', 'IBM Plex Mono',
          'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace',
        ],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        pixel: ['"Press Start 2P"', 'VT323', 'ui-monospace', 'monospace'],
        crt: ['VT323', 'JetBrains Mono', 'ui-monospace', 'monospace'],
        mc: ['Minecraft', '"Pixelify Sans"', 'Silkscreen', '"Press Start 2P"', 'monospace'],
      },
      colors: {
        cream: {
          50:  '#faf6ed',
          100: '#f5efe4',
          200: '#ebe1cc',
          300: '#dccea8',
          400: '#c8b27d',
        },
        ink: {
          900: '#1a1a1a',
          800: '#262626',
          700: '#3a3a3a',
        },
        neon: {
          orange: '#ff7a3d',
          amber: '#f5a524',
          cyan: '#22d3ee',
          green: '#4ade80',
          pink: '#ec4899',
        },
        terminal: {
          900: '#0a0c12',
          800: '#0f1117',
          700: '#161a23',
          600: '#1f2433',
          500: '#2a3043',
        },
      },
      boxShadow: {
        'retro': '2px 2px 0 0 rgba(0,0,0,0.85)',
        'retro-lg': '4px 4px 0 0 rgba(0,0,0,0.85)',
        'neon': '0 0 0 1px rgba(255,122,61,0.6), 0 0 20px rgba(255,122,61,0.25)',
        'glow-cyan': '0 0 12px rgba(34,211,238,0.45)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'scan': 'scan 6s linear infinite',
        'float': 'float 8s ease-in-out infinite',
        'flicker': 'flicker 4s linear infinite',
        'crt-flicker': 'crtFlicker 6s steps(8) infinite',
        'pixel-bob': 'pixelBob 2.4s steps(6) infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        flicker: {
          '0%, 100%': { opacity: 1 },
          '47%': { opacity: 1 },
          '48%': { opacity: 0.4 },
          '49%': { opacity: 1 },
          '93%': { opacity: 1 },
          '94%': { opacity: 0.6 },
          '95%': { opacity: 1 },
        },
        crtFlicker: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.96 },
          '52%': { opacity: 1 },
          '90%': { opacity: 0.98 },
        },
        pixelBob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
      },
    },
  },
  plugins: [],
};
