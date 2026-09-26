import { Activity, GitBranch, Shield, Zap } from 'lucide-react';
import { ENTERPRISE_MESH, FIXTURE_SCENARIOS } from '@/lib/fixtures/enterprise-mesh';

// ---------------------------------------------------------------------------
// Static derived values (computed at build-time on the server)
// ---------------------------------------------------------------------------

const MESH_STATS = ENTERPRISE_MESH.stats;
const SCENARIO_COUNT = Object.keys(FIXTURE_SCENARIOS).length;

const BUILD_INDICATORS: Array<{ label: string; value: string; status: 'ok' | 'warn' | 'info' }> = [
  { label: 'Graph Nodes', value: String(MESH_STATS.totalNodes), status: 'ok' },
  { label: 'Dependency Edges', value: String(MESH_STATS.totalEdges), status: 'ok' },
  { label: 'Service Boundaries', value: String(MESH_STATS.serviceCount), status: 'ok' },
  { label: 'Fixture Scenarios', value: String(SCENARIO_COUNT), status: 'info' },
];

const STATUS_COLOR: Record<'ok' | 'warn' | 'info', string> = {
  ok: 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10',
  warn: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  info: 'text-sky-400 border-sky-400/30 bg-sky-400/10',
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HomePage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16 bg-slate-950">
      {/* ── Header ── */}
      <div className="mb-12 flex flex-col items-center gap-4 text-center">
        {/* IBM Bob 2.0 badge */}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1 text-xs font-semibold tracking-widest text-violet-400 uppercase">
          <Zap size={12} />
          IBM Bob 2.0 · Hackathon Build
        </span>

        {/* Title */}
        <h1 className="font-mono text-6xl font-bold tracking-tight text-slate-100">
          Dry<span className="text-violet-500">Run</span>
        </h1>

        <p className="max-w-xl text-base leading-relaxed text-slate-400">
          Pre-deployment blast-radius and chaos simulator.{' '}
          <span className="text-slate-200">Know the full impact</span> of every change before it
          reaches production.
        </p>
      </div>

      {/* ── Build Readiness Indicators ── */}
      <section aria-label="Build readiness indicators" className="mb-10 w-full max-w-lg">
        <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-slate-500">
          System Readiness
        </h2>
        <ul className="grid grid-cols-2 gap-3">
          {BUILD_INDICATORS.map(({ label, value, status }) => (
            <li
              key={label}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 font-mono text-sm ${STATUS_COLOR[status]}`}
            >
              <span className="text-slate-400">{label}</span>
              <span className="font-bold">{value}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Pipeline Stages ── */}
      <section aria-label="Pipeline stages" className="mb-10 w-full max-w-lg">
        <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-slate-500">
          Analysis Pipeline
        </h2>
        <ol className="flex flex-col gap-2">
          {PIPELINE_STAGES.map(({ icon: Icon, label, description }, i) => (
            <li
              key={label}
              className="flex items-start gap-3 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-600 font-mono text-xs text-slate-500">
                {i + 1}
              </span>
              <Icon size={16} className="mt-0.5 shrink-0 text-violet-400" />
              <div>
                <p className="text-sm font-semibold text-slate-200">{label}</p>
                <p className="text-xs text-slate-500">{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Footer tag ── */}
      <p className="font-mono text-xs text-slate-600">
        contracts v0.1.0 · fixture mesh loaded · types validated
      </p>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Static pipeline stage data
// ---------------------------------------------------------------------------

const PIPELINE_STAGES = [
  {
    icon: GitBranch,
    label: 'AST Dependency Ingester',
    description: 'Parse import graph, call sites, and service boundaries from the repository.',
  },
  {
    icon: Activity,
    label: 'Blast-Radius Risk Evaluator',
    description: 'Weighted BFS/DFS reachability analysis with per-node impact scores.',
  },
  {
    icon: Zap,
    label: 'Chaos Fault Injection Engine',
    description: 'Propagate SERVICE_OUTAGE, LATENCY_SPIKE, and NETWORK_PARTITION scenarios.',
  },
  {
    icon: Shield,
    label: 'watsonx Release Gate Synthesizer',
    description: 'IBM Granite risk narrative, severity classification, and APPROVED / BLOCKED gate.',
  },
] as const;
