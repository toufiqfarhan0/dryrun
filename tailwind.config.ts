import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Telemetry severity spectrum
        critical: '#ef4444',  // red-500
        high: '#f97316',      // orange-500
        medium: '#facc15',    // yellow-400
        low: '#10b981',       // emerald-500
        info: '#38bdf8',      // sky-400
        accent: '#8b5cf6',    // violet-500
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      backgroundImage: {
        'grid-slate': `linear-gradient(rgba(51,65,85,0.3) 1px, transparent 1px),
                       linear-gradient(90deg, rgba(51,65,85,0.3) 1px, transparent 1px)`,
      },
      backgroundSize: {
        grid: '32px 32px',
      },
    },
  },
  plugins: [],
};

export default config;
