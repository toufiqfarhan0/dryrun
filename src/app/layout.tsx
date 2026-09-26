import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DryRun — Pre-Deployment Blast-Radius Simulator',
  description:
    'Simulate fault propagation and compute blast radius before any code ships to production.',
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
