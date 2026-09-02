import type { Config } from 'tailwindcss';

/**
 * Podshar design tokens.
 *
 * The palette is deliberately tiny. A lookbook reads as expensive because it
 * repeats three or four values with discipline, not because it has a big ramp.
 *   canvas  #f7efe5  warm cream ground
 *   ink     #7b5246  earthy brown, all text + hairlines
 *   sand    #D8C3B1  light accent: fills, resting state
 *   clay    #A88B7D  mid accent: active states, borders, inverted text ground
 *
 * Shadows and panel widths are tokens too, so no component ever writes a raw
 * colour or a magic layout number.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f7efe5',
        ink: '#7b5246',
        sand: '#D8C3B1',
        clay: '#A88B7D',
        // Derived, never hand-typed at call sites.
        'ink-muted': 'rgba(123, 82, 70, 0.62)',
        'ink-faint': 'rgba(123, 82, 70, 0.28)',
        hairline: 'rgba(123, 82, 70, 0.18)',
        'canvas-sunk': '#f1e5d7'
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif']
      },
      letterSpacing: {
        label: '0.22em',
        wordmark: '0.34em'
      },
      fontSize: {
        // Editorial scale. The greeting is the only thing allowed above 5xl.
        greeting: ['clamp(2rem, 6vw, 5rem)', { lineHeight: '1.04', letterSpacing: '-0.02em' }],
        label: ['0.625rem', { lineHeight: '1', letterSpacing: '0.22em' }]
      },
      width: {
        // Panel widths live here so the shell and the panels cannot drift apart.
        sidebar: '17rem',
        'sidebar-lg': '20rem',
        chat: '21rem'
      },
      boxShadow: {
        // The seal's depth: a pressed inner well plus a soft outer lift.
        seal: 'inset 0 2px 10px rgba(123, 82, 70, 0.22), inset 0 -1px 0 rgba(247, 239, 229, 0.6)',
        'seal-hover':
          'inset 0 2px 14px rgba(123, 82, 70, 0.34), 0 14px 40px -18px rgba(123, 82, 70, 0.55)',
        panel: '0 24px 60px -30px rgba(123, 82, 70, 0.5)'
      },
      transitionTimingFunction: {
        // One easing for every panel and every hover. Consistency reads premium.
        drape: 'cubic-bezier(0.22, 1, 0.36, 1)'
      },
      transitionDuration: {
        drape: '520ms'
      },
      keyframes: {
        'wisp-drift': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-3px) rotate(-4deg)' }
        },
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'orbit': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' }
        }
      },
      animation: {
        'wisp-drift': 'wisp-drift 6s ease-in-out infinite',
        'rise-in': 'rise-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        // Slow enough to read as a machined object, not a spinner.
        orbit: 'orbit 64s linear infinite'
      }
    }
  },
  plugins: []
};

export default config;
