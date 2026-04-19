/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        textMain: 'rgb(var(--color-text-main) / <alpha-value>)',
        textMuted: 'rgb(var(--color-text-muted) / <alpha-value>)',
        primaryHover: 'rgb(var(--color-primary-hover) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        borderLight: 'var(--color-border)',
        "surface-container": "#ffffff66", // 40% opaque
        "surface-container-highest": "#ffffffCC", // 80% opaque
        "on-error-container": "#410002",
        "inverse-surface": "#1e293b",
        "surface-tint": "#10b981",
        "surface-container-low": "#ffffff33", // 20% opaque
        "on-tertiary-fixed-variant": "#31111d",
        "on-tertiary-container": "#31111d",
        "surface-container-lowest": "#ffffff1A", // 10% opaque
        "primary-fixed": "#6ffbbe",
        "on-secondary-fixed-variant": "#2f2ebe",
        "on-tertiary-fixed": "#40000d",
        "on-surface": "#1e293b",
        "on-primary-fixed-variant": "#005236",
        "inverse-on-surface": "#f8fafc",
        "secondary-container": "#e0e7ff",
        "on-surface-variant": "#475569",
        "on-primary-container": "#064e3b",
        "surface-variant": "#ffffff99", // 60% opaque
        "on-tertiary": "#ffffff",
        "primary": "#10b981",
        "on-secondary-fixed": "#07006c",
        "surface-bright": "#ffffff",
        "surface-container-high": "#ffffff99", // 60% opaque
        "error-container": "#ffdad6",
        "on-secondary-container": "#1e3a8a",
        "on-error": "#ffffff",
        "on-secondary": "#ffffff",
        "surface-dim": "#cbd5e1",
        "primary-fixed-dim": "#10b981",
        "inverse-primary": "#a7f3d0",
        "tertiary": "#f43f5e",
        "tertiary-container": "#ffe4e6",
        "on-primary": "#ffffff",
        "outline-variant": "#cbd5e1",
        "error": "#b91c1c",
        "secondary-fixed": "#e1e0ff",
        "on-primary-fixed": "#002113",
        "on-background": "#0f172a",
        "secondary-fixed-dim": "#c0c1ff",
        "tertiary-fixed": "#ffdadb",
        "outline": "#64748b",
        "tertiary-fixed-dim": "#ffb2b7",
        "primary-container": "#d1fae5",
        "background-stitch": "#f8fafc",
        "surface-stitch": "#ffffff",
      },
      boxShadow: {
        'soft': '10px 10px 20px var(--shadow-dark), -10px -10px 20px var(--shadow-light)',
        'soft-inner': 'inset 5px 5px 10px var(--shadow-dark), inset -5px -5px 10px var(--shadow-light)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        headline: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
