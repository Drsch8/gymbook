/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // New "Instrument Panel" system. `sans` stays Inter until every screen
        // is migrated onto `body`/`display`, so nothing shifts mid-rebuild.
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Neutral roles (light/dark via CSS vars on :root / .dark)
        bg: 'var(--c-bg)',
        surface: 'var(--c-surface)',
        elevated: 'var(--c-elevated)',
        line: 'var(--c-line)',
        ink: 'var(--c-ink)',
        muted: 'var(--c-muted)',
        faint: 'var(--c-faint)',
        // Semantic accents — always paired with a label/icon in use
        brand: { DEFAULT: 'var(--c-brand)', ink: 'var(--c-brand-ink)' },
        work: 'var(--c-work)',
        rest: 'var(--c-rest)',
        klass: 'var(--c-class)',
        training: 'var(--c-training)',
        pr: 'var(--c-pr)',
        done: 'var(--c-done)',
        danger: 'var(--c-danger)',
        // Program-focus hues
        'focus-push': 'var(--c-focus-push)',
        'focus-pull': 'var(--c-focus-pull)',
        'focus-legs': 'var(--c-focus-legs)',
        'focus-core': 'var(--c-focus-core)',
        // Workout timer "focus mode" — always-dark, theme-invariant
        fmbg: 'var(--c-focus-bg)',
        fmink: 'var(--c-focus-ink)',
        fmdim: 'var(--c-focus-dim)',
        fmline: 'var(--c-focus-line)',
      },
      borderRadius: {
        control: '4px',
        card: '8px',
        panel: '12px',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.85)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        panelIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        panelOut: {
          from: { opacity: '1', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(0.96)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-out',
        scaleIn: 'scaleIn 0.4s ease-out',
        panelIn: 'panelIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        panelOut: 'panelOut 0.3s ease-in forwards',
      },
    },
  },
  plugins: [],
}
