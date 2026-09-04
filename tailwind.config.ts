import type { Config } from 'tailwindcss';

/**
 * Podshar design tokens — block-based minimalism.
 *
 * The palette is unchanged; how it is applied is not. Everything is flat now:
 * solid fills, solid outlines, sharp corners, no gradients and no blur. Depth,
 * where a surface genuinely needs it, comes from `shadow-block` — a hard offset
 * with zero blur, which reads as a stacked sheet of paper rather than a glow.
 *
 *   canvas  #f7efe5  cream ground
 *   ink     #7b5246  text and block outlines
 *   sand    #D8C3B1  block fills, resting accent
 *   clay    #A88B7D  active states, inverted text ground
 *
 * One typeface, Roboto, at every size and weight. Hierarchy is carried by
 * weight, size and letter-spacing — never by a second family.
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
        'ink-faint': 'rgba(123, 82, 70, 0.32)',
        hairline: 'rgba(123, 82, 70, 0.18)',
        // The outline every bento block is drawn with.
        rule: 'rgba(123, 82, 70, 0.34)',
        'canvas-sunk': '#f1e5d7'
      },
      fontFamily: {
        // Roboto everywhere. `display` is kept as an alias so no call site has
        // to change to prove there is only one family in the system.
        sans: ['var(--font-roboto)', 'Roboto', 'system-ui', 'sans-serif'],
        display: ['var(--font-roboto)', 'Roboto', 'system-ui', 'sans-serif']
      },
      letterSpacing: {
        label: '0.16em',
        wordmark: '0.3em'
      },
      fontSize: {
        // The greeting is the only thing allowed to run this large.
        greeting: ['clamp(1.75rem, 5vw, 4rem)', { lineHeight: '1.06', letterSpacing: '-0.03em' }],
        label: ['0.625rem', { lineHeight: '1', letterSpacing: '0.16em' }],
        stat: ['clamp(1.5rem, 2.6vw, 2.25rem)', { lineHeight: '1', letterSpacing: '-0.02em' }]
      },
      width: {
        // Panel widths live here so the shell and the panels cannot drift apart.
        sidebar: '17rem',
        'sidebar-lg': '20rem',
        chat: '21rem'
      },
      borderRadius: {
        // Sharp by default. `sm` is the largest curve anything is allowed.
        DEFAULT: '0px',
        sm: '2px'
      },
      boxShadow: {
        // Zero blur, hard offset: a stacked sheet, not a glow.
        block: '4px 4px 0 0 rgba(123, 82, 70, 0.18)',
        'block-sm': '2px 2px 0 0 rgba(123, 82, 70, 0.22)',
        none: 'none'
      },
      transitionTimingFunction: {
        // One easing for every panel and hover in the system.
        drape: 'cubic-bezier(0.22, 1, 0.36, 1)'
      },
      transitionDuration: {
        drape: '420ms'
      },
      keyframes: {
        'wisp-drift': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-3px) rotate(-4deg)' }
        },
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'wisp-drift': 'wisp-drift 6s ease-in-out infinite',
        'rise-in': 'rise-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both'
      }
    }
  },
  plugins: []
};

export default config;
