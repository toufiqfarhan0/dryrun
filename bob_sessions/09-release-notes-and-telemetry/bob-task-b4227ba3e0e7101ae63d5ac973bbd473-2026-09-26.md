# Role: Observability & Developer Experience Agent
Context: Refer to `AGENTS.md`, `.bobrules`, and `docs/architecture.md`.

Enhance DryRun with automated release notes generation, real-time telemetry streaming, and custom repository upload:

1. Telemetry Event Stream (`src/components/TelemetryDrawer.tsx`):
   - Collapsible bottom drawer showing real-time event logs with timestamps and status colors:
     * `[AST]` Dependency graph ingestion events
     * `[BLAST]` Reverse BFS reachability calculations and scoring
     * `[CHAOS]` Active fault injection ticks and decaying cascades
     * `[WATSONX]` SSE token streaming and gate decision status
   - Search/filter by log level ('ALL' | 'INFO' | 'WARN' | 'ERROR').
   - "Clear" and "Export Logs (.json)" buttons.

2. Automated Release Notes & Runbooks (`src/components/ReleaseNotesModal.tsx`):
   - Modal or drawer accessible from the top bar:
     * Generates a clean markdown PR Release Summary based on the blast radius and simulation:
       - Impacted Services & APIs
       - High-Risk Dependency Changes
       - Recommended Pre-Release Testing Matrix
       - Rollback Runbook (step-by-step shell commands)
     * "Copy Markdown" button for easy pasting into GitHub PRs or Slack incident channels.

3. Custom Repository Ingestion Modal (`src/components/RepoUploadModal.tsx`):
   - Modal allowing users and hackathon judges to:
     * Paste a GitHub repository URL (e.g. `https://github.com/expressjs/express`)
     * Upload a JSON / text file tree
     * Or select one of the built-in enterprise presets
   - Ingests and routes directly to `/analyze` with the new graph.

4. Integration:
   - Wire these three components cleanly into `src/app/analyze/page.tsx` and the top bar.
   - Verify that `pnpm build` or `pnpm tsc --noEmit` passes with zero errors.

---

**Status:** active  **Date:** 2026-09-26

---

### 👤 User

Role: Observability & Developer Experience Agent
Context: Refer to `AGENTS.md`, `.bobrules`, and `docs/architecture.md`.

Enhance DryRun with automated release notes generation, real-time telemetry streaming, and custom repository upload:

1. Telemetry Event Stream (`src/components/TelemetryDrawer.tsx`):
   - Collapsible bottom drawer showing real-time event logs with timestamps and status colors:
     * `[AST]` Dependency graph ingestion events
     * `[BLAST]` Reverse BFS reachability calculations and scoring
     * `[CHAOS]` Active fault injection ticks and decaying cascades
     * `[WATSONX]` SSE token streaming and gate decision status
   - Search/filter by log level ('ALL' | 'INFO' | 'WARN' | 'ERROR').
   - "Clear" and "Export Logs (.json)" buttons.

2. Automated Release Notes & Runbooks (`src/components/ReleaseNotesModal.tsx`):
   - Modal or drawer accessible from the top bar:
     * Generates a clean markdown PR Release Summary based on the blast radius and simulation:
       - Impacted Services & APIs
       - High-Risk Dependency Changes
       - Recommended Pre-Release Testing Matrix
       - Rollback Runbook (step-by-step shell commands)
     * "Copy Markdown" button for easy pasting into GitHub PRs or Slack incident channels.

3. Custom Repository Ingestion Modal (`src/components/RepoUploadModal.tsx`):
   - Modal allowing users and hackathon judges to:
     * Paste a GitHub repository URL (e.g. `https://github.com/expressjs/express`)
     * Upload a JSON / text file tree
     * Or select one of the built-in enterprise presets
   - Ingests and routes directly to `/analyze` with the new graph.

4. Integration:
   - Wire these three components cleanly into `src/app/analyze/page.tsx` and the top bar.
   - Verify that `pnpm build` or `pnpm tsc --noEmit` passes with zero errors.

---

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[-] Explore existing codebase structure and read relevant files
[ ] Build TelemetryDrawer component
[ ] Build ReleaseNotesModal component
[ ] Build RepoUploadModal component
[ ] Wire all three components into analyze page and top bar
[ ] Run pnpm build / tsc --noEmit and fix any errors


### 🤖 Assistant

> 🔧 called: list_files, glob



> 🔧 **list_files** — .

> 🔧 **glob** — src/**/*.{tsx,ts}

### 🤖 Assistant

> 🔧 called: list_files, read_file



> 🔧 **read_file** — .bobrules

> 🔧 **list_files** — src

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — src/types/index.ts

> 🔧 **read_file** — src/app/analyze/page.tsx

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — src/components/visualizer/index.ts

> 🔧 **read_file** — src/components/visualizer/context/SimulationContext.tsx

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — src/components/visualizer/context/simulation-reducer.ts

> 🔧 **read_file** — src/lib/fixtures/enterprise-mesh.ts

### 🤖 Assistant

> 🔧 called: read_file, read_file

Now I have enough context. Let me read the GateReport component to understand the modal/drawer pattern used in the project:

> 🔧 **read_file** — src/components/visualizer/GateReport.tsx

> 🔧 **read_file** — src/components/visualizer/ControlPanel.tsx

### 🤖 Assistant

> 🔧 called: update_todo_list

Now I have a thorough understanding of the codebase. Let me build all three components and wire them in. I'll work in parallel:

> 🔧 **update_todo_list** — 
[x] Explore existing codebase structure and read relevant files
[-] Build TelemetryDrawer component
[ ] Build ReleaseNotesModal component
[ ] Build RepoUploadModal component
[ ] Wire all three components into analyze page and top bar
[ ] Run pnpm build / tsc --noEmit and fix any errors


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — src/components/TelemetryDrawer.tsx

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Explore existing codebase structure and read relevant files
[x] Build TelemetryDrawer component
[-] Build ReleaseNotesModal component
[ ] Build RepoUploadModal component
[ ] Wire all three components into analyze page and top bar
[ ] Run pnpm build / tsc --noEmit and fix any errors


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — 'use client';

/**
 * DryRun — Release Notes & Runbook Modal
 * Observability & Developer Experience Agent
 *
 * Generates a clean Markdown PR Release Summary from the live blast-radius
 * and chaos simulation data.  Sections:
 *   1. Impacted Services & APIs
 *   2. High-Risk Dependency Changes
 *   3. Recommended Pre-Release Testing Matrix
 *   4. Rollback Runbook (step-by-step shell commands)
 *
 * "Copy Markdown" button for GitHub PRs / Slack incident channels.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { X, Copy, Check, FileText } from 'lucide-react';
import { useSimulation } from '@/components/visualizer';
import type {
  BlastRadiusReport,
  ChaosSimulationResult,
  ReleaseGateDecision,
  NodeId,
} from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FONT_MONO: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
};

const SEVERITY_MAP: Record<string, string> = {
  CRITICAL: '🔴',
  HIGH: '🟠',
  MEDIUM: '🟡',
  LOW: '🟢',
};

// ---------------------------------------------------------------------------
// Markdown builder
// ---------------------------------------------------------------------------

function buildMarkdown(
  blastReport: BlastRadiusReport | null,
  chaosResult: ChaosSimulationResult | null,
  gateDecision: ReleaseGateDecision | null,
): string {
  const prMeta = blastReport?.changeSet?.prMetadata;
  const title = prMeta?.title ?? 'PR Release Summary';
  const author = prMeta?.author ?? 'unknown';
  const branch = prMeta?.targetBranch ?? 'main';
  const now = new Date().toISOString();

  const blastScore = gateDecision?.blastScore ?? chaosResult?.aggregateRiskScore ?? blastReport?.overallBlastScore ?? 0;
  const severity = gateDecision?.severity ?? 'UNKNOWN';
  const decision = gateDecision?.decision ?? 'PENDING';
  const gate = gateDecision ? `**${decision}**` : '_Not yet evaluated_';
  const sevEmoji = SEVERITY_MAP[severity] ?? '⚪';

  // --- Section 1: Impacted Services & APIs ---
  const topRisky: NodeId[] = blastReport?.topRiskyNodes ?? [];
  const impacts = blastReport?.impacts ?? {};
  const graphNodes = blastReport?.graph?.nodes ?? {};

  const impactedSection = topRisky.length > 0
    ? topRisky
        .slice(0, 8)
        .map((id) => {
          const node = graphNodes[id];
          const impact = impacts[id];
          const score = impact?.impactScore ?? 0;
          const critical = impact?.onCriticalPath ? ' ⚠️ critical-path' : '';
          const label = node?.label ?? id;
          return `| \`${label}\` | \`${id}\` | ${score}/100 |${critical} |`;
        })
        .join('\n')
    : '| _(no data)_ | — | — | |';

  // --- Section 2: High-Risk Dependency Changes ---
  const changedFiles = blastReport?.changeSet?.changedFiles ?? [];
  const addedFiles = blastReport?.changeSet?.addedFiles ?? [];
  const deletedFiles = blastReport?.changeSet?.deletedFiles ?? [];

  const changesSection = [
    ...changedFiles.map((f) => `- ✏️  \`${f}\``),
    ...addedFiles.map((f) => `- ➕ \`${f}\``),
    ...deletedFiles.map((f) => `- ❌ \`${f}\``),
  ].join('\n') || '- _(no file changes recorded)_';

  // --- Section 3: Testing Matrix ---
  const criticalChain = chaosResult?.criticalFailureChain ?? [];
  const testMatrix = criticalChain.length > 0
    ? criticalChain
        .slice(0, 6)
        .map((id) => {
          const node = graphNodes[id];
          const label = node?.label ?? id;
          const prob = chaosResult?.nodeResults?.[id]?.failureProbability ?? 0;
          const pct = Math.round(prob * 100);
          return `| \`${label}\` | Integration | Failure probability: ${pct}% | High |`;
        })
        .join('\n')
    : '| _(run chaos simulation to populate)_ | — | — | — |';

  // --- Section 4: Rollback Runbook ---
  const runbook = gateDecision?.rollbackRunbook ?? [];
  const runbookSection = runbook.length > 0
    ? runbook.map((step, i) => `${i + 1}. \`${step}\``).join('\n')
    : '_No rollback runbook available. Run the watsonx gate evaluation to generate one._';

  // --- Mitigations ---
  const mitigations = gateDecision?.mitigations ?? [];
  const mitigationSection = mitigations.length > 0
    ? mitigations
        .map((m) => `- **${m.priority}** · \`${m.nodeId}\`: ${m.description}`)
        .join('\n')
    : '_No mitigations generated yet._';

  return `# 🚀 DryRun Release Summary

> Generated by **DryRun** · ${now}

## Overview

| Field | Value |
|---|---|
| PR Title | ${title} |
| Author | \`${author}\` |
| Target Branch | \`${branch}\` |
| Blast Score | **${Math.round(blastScore)}/100** |
| Severity | ${sevEmoji} ${severity} |
| Gate Decision | ${gate} |

---

## 1. Impacted Services & APIs

| Service | Node ID | Impact Score | Notes |
|---|---|---|---|
${impactedSection}

---

## 2. High-Risk Dependency Changes

${changesSection}

---

## 3. Recommended Pre-Release Testing Matrix

| Service | Test Type | Risk Signal | Priority |
|---|---|---|---|
${testMatrix}

---

## 4. Recommended Mitigations

${mitigationSection}

---

## 5. Rollback Runbook

${runbookSection}

---

_DryRun · Pre-deployment blast-radius & chaos simulator · Powered by IBM watsonx Granite_
`;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ReleaseNotesModalProps {
  open: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// CopyButton
// ---------------------------------------------------------------------------

function CopyButton({ text }: { text: string }): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback((): void => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-600 hover:border-violet-500 bg-slate-800 hover:bg-violet-900/30 text-slate-300 hover:text-violet-300 text-xs transition-colors"
      style={FONT_MONO}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          Copy Markdown
        </>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Section heading
// ---------------------------------------------------------------------------

function SectionHeading({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <h3
      className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 mt-5 first:mt-0"
      style={FONT_MONO}
    >
      {children}
    </h3>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReleaseNotesModal({ open, onClose }: ReleaseNotesModalProps): React.JSX.Element | null {
  const { state } = useSimulation();
  const { blastReport, chaosResult, gateDecision } = state;

  const markdown = useMemo(
    () => buildMarkdown(blastReport, chaosResult, gateDecision),
    [blastReport, chaosResult, gateDecision],
  );

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Release Notes"
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[85vh] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-slate-200" style={FONT_MONO}>
              Release Notes & Runbook
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <CopyButton text={markdown} />
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-200 transition-colors ml-1"
              aria-label="Close release notes"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-1">

          {/* Overview table */}
          <SectionHeading>Overview</SectionHeading>
          <OverviewTable blastReport={blastReport} chaosResult={chaosResult} gateDecision={gateDecision} />

          {/* Impacted Services */}
          <SectionHeading>1 · Impacted Services & APIs</SectionHeading>
          <ImpactedServicesTable blastReport={blastReport} />

          {/* Dependency Changes */}
          <SectionHeading>2 · High-Risk Dependency Changes</SectionHeading>
          <DependencyChangeList blastReport={blastReport} />

          {/* Testing Matrix */}
          <SectionHeading>3 · Pre-Release Testing Matrix</SectionHeading>
          <TestingMatrix chaosResult={chaosResult} blastReport={blastReport} />

          {/* Rollback Runbook */}
          <SectionHeading>4 · Rollback Runbook</SectionHeading>
          <RunbookBlock gateDecision={gateDecision} />
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-3 border-t border-slate-700 flex justify-between items-center">
          <p className="text-xs text-slate-600" style={FONT_MONO}>
            Powered by IBM watsonx Granite
          </p>
          <p className="text-xs text-slate-600" style={FONT_MONO}>
            {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sub-sections
// ---------------------------------------------------------------------------

function OverviewTable({
  blastReport,
  chaosResult,
  gateDecision,
}: {
  blastReport: BlastRadiusReport | null;
  chaosResult: ChaosSimulationResult | null;
  gateDecision: ReleaseGateDecision | null;
}): React.JSX.Element {
  const blastScore = gateDecision?.blastScore ?? chaosResult?.aggregateRiskScore ?? blastReport?.overallBlastScore ?? 0;
  const severity = gateDecision?.severity ?? '—';
  const decision = gateDecision?.decision ?? 'PENDING';
  const sevEmoji = SEVERITY_MAP[severity] ?? '⚪';

  const rows: Array<{ label: string; value: string | React.JSX.Element }> = [
    { label: 'Blast Score', value: `${Math.round(blastScore)} / 100` },
    { label: 'Severity', value: `${sevEmoji} ${severity}` },
    {
      label: 'Gate Decision',
      value: (
        <span
          className={
            decision === 'APPROVED'
              ? 'text-emerald-400 font-bold'
              : decision === 'BLOCKED'
              ? 'text-red-400 font-bold'
              : 'text-slate-500'
          }
        >
          {decision}
        </span>
      ),
    },
    {
      label: 'Affected Nodes',
      value: `${Object.keys(blastReport?.impacts ?? {}).length} nodes`,
    },
    {
      label: 'Critical Paths',
      value: `${blastReport?.criticalPaths?.length ?? 0} paths`,
    },
  ];

  return (
    <div className="rounded-md border border-slate-700 bg-slate-800 overflow-hidden">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center gap-4 px-4 py-2 border-b border-slate-700/60 last:border-0"
        >
          <span className="w-36 text-xs text-slate-500 shrink-0" style={FONT_MONO}>
            {row.label}
          </span>
          <span className="text-xs text-slate-200" style={FONT_MONO}>
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function ImpactedServicesTable({ blastReport }: { blastReport: BlastRadiusReport | null }): React.JSX.Element {
  const topRisky = blastReport?.topRiskyNodes ?? [];
  const impacts = blastReport?.impacts ?? {};
  const graphNodes = blastReport?.graph?.nodes ?? {};

  if (topRisky.length === 0) {
    return <EmptyState message="Run a simulation to see impacted services." />;
  }

  return (
    <div className="rounded-md border border-slate-700 overflow-hidden">
      <table className="w-full text-xs" style={FONT_MONO}>
        <thead>
          <tr className="bg-slate-800 text-slate-500 text-left">
            <th className="px-3 py-2 font-semibold">Service</th>
            <th className="px-3 py-2 font-semibold">Node ID</th>
            <th className="px-3 py-2 font-semibold text-right">Score</th>
            <th className="px-3 py-2 font-semibold">Critical Path</th>
          </tr>
        </thead>
        <tbody>
          {topRisky.slice(0, 8).map((id) => {
            const node = graphNodes[id];
            const impact = impacts[id];
            const score = impact?.impactScore ?? 0;
            const critical = impact?.onCriticalPath ?? false;
            const label = node?.label ?? id;
            const scoreColor =
              score >= 80 ? 'text-red-400' : score >= 60 ? 'text-orange-400' : score >= 40 ? 'text-yellow-400' : 'text-emerald-400';
            return (
              <tr key={id} className="border-t border-slate-700/60 hover:bg-slate-800/50">
                <td className="px-3 py-2 text-slate-200">{label}</td>
                <td className="px-3 py-2 text-slate-500">{id}</td>
                <td className={`px-3 py-2 text-right font-bold ${scoreColor}`}>{score}</td>
                <td className="px-3 py-2">
                  {critical ? (
                    <span className="text-yellow-400">⚠️ Yes</span>
                  ) : (
                    <span className="text-slate-600">No</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DependencyChangeList({ blastReport }: { blastReport: BlastRadiusReport | null }): React.JSX.Element {
  const changed = blastReport?.changeSet?.changedFiles ?? [];
  const added = blastReport?.changeSet?.addedFiles ?? [];
  const deleted = blastReport?.changeSet?.deletedFiles ?? [];
  const all = [
    ...changed.map((f) => ({ file: f, type: '✏️  modified' as const })),
    ...added.map((f) => ({ file: f, type: '➕ added' as const })),
    ...deleted.map((f) => ({ file: f, type: '❌ deleted' as const })),
  ];

  if (all.length === 0) {
    return <EmptyState message="No change-set files recorded in this run." />;
  }

  return (
    <ul className="space-y-1">
      {all.map(({ file, type }) => (
        <li key={file} className="flex items-center gap-2 text-xs" style={FONT_MONO}>
          <span className="text-slate-500">{type}</span>
          <code className="text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
            {file}
          </code>
        </li>
      ))}
    </ul>
  );
}

function TestingMatrix({
  chaosResult,
  blastReport,
}: {
  chaosResult: ChaosSimulationResult | null;
  blastReport: BlastRadiusReport | null;
}): React.JSX.Element {
  const criticalChain = chaosResult?.criticalFailureChain ?? [];
  const graphNodes = blastReport?.graph?.nodes ?? {};

  if (criticalChain.length === 0) {
    return <EmptyState message="Run chaos simulation to generate a testing matrix." />;
  }

  return (
    <div className="rounded-md border border-slate-700 overflow-hidden">
      <table className="w-full text-xs" style={FONT_MONO}>
        <thead>
          <tr className="bg-slate-800 text-slate-500 text-left">
            <th className="px-3 py-2 font-semibold">Service</th>
            <th className="px-3 py-2 font-semibold">Test Type</th>
            <th className="px-3 py-2 font-semibold">Risk Signal</th>
            <th className="px-3 py-2 font-semibold">Priority</th>
          </tr>
        </thead>
        <tbody>
          {criticalChain.slice(0, 6).map((id) => {
            const node = graphNodes[id];
            const label = node?.label ?? id;
            const prob = chaosResult?.nodeResults?.[id]?.failureProbability ?? 0;
            const pct = Math.round(prob * 100);
            const priority = pct >= 70 ? 'HIGH' : pct >= 40 ? 'MEDIUM' : 'LOW';
            const priorityColor =
              priority === 'HIGH' ? 'text-red-400' : priority === 'MEDIUM' ? 'text-yellow-400' : 'text-emerald-400';
            return (
              <tr key={id} className="border-t border-slate-700/60 hover:bg-slate-800/50">
                <td className="px-3 py-2 text-slate-200">{label}</td>
                <td className="px-3 py-2 text-slate-400">Integration</td>
                <td className="px-3 py-2 text-slate-400">Failure: {pct}%</td>
                <td className={`px-3 py-2 font-semibold ${priorityColor}`}>{priority}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RunbookBlock({ gateDecision }: { gateDecision: ReleaseGateDecision | null }): React.JSX.Element {
  const runbook = gateDecision?.rollbackRunbook ?? [];

  if (runbook.length === 0) {
    return (
      <EmptyState message="Run the watsonx gate evaluation to generate a rollback runbook." />
    );
  }

  return (
    <div className="rounded-md border border-slate-700 bg-[#020617] p-4 overflow-x-auto">
      <pre className="text-xs text-emerald-400 leading-relaxed" style={FONT_MONO}>
        {runbook.map((step, i) => `${String(i + 1).padStart(2, ' ')}. ${step}`).join('\n')}
      </pre>
    </div>
  );
}

function EmptyState({ message }: { message: string }): React.JSX.Element {
  return (
    <p className="text-xs text-slate-600 px-1 py-2" style={FONT_MONO}>
      {message}
    </p>
  );
}


### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Explore existing codebase structure and read relevant files
[x] Build TelemetryDrawer component
[x] Build ReleaseNotesModal component
[-] Build RepoUploadModal component
[ ] Wire all three components into analyze page and top bar
[ ] Run pnpm build / tsc --noEmit and fix any errors


### 🤖 Assistant

> 🔧 called: read_file, read_file

Now let me read the fixtures to understand the preset data structure before building the RepoUploadModal:

> 🔧 **read_file** — src/lib/fixtures/enterprise-mesh.ts

> 🔧 **read_file** — src/app/api/analyze/route.ts

### 🤖 Assistant

> 🔧 called: read_file

Now let me look at how ControlPanel calls /api/analyze to understand the existing ingestion flow:

> 🔧 **read_file** — src/components/visualizer/ControlPanel.tsx

### 🤖 Assistant

> 🔧 called: write_file

Now I have all the context. Let me build the RepoUploadModal:

> 🔧 **write_file** — 'use client';

/**
 * DryRun — Custom Repository Ingestion Modal
 * Observability & Developer Experience Agent
 *
 * Allows users and hackathon judges to ingest a custom repository via:
 *   1. GitHub repository URL
 *   2. JSON / text file-tree upload
 *   3. Built-in enterprise preset selection
 *
 * On submit → POST /api/analyze → loadGraph + startSimulation
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  X,
  Github,
  Upload,
  Database,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useSimulation } from '@/components/visualizer';
import { FIXTURE_SCENARIOS } from '@/lib/fixtures/enterprise-mesh';
import type { DependencyGraph, BlastRadiusReport } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type IngestionMode = 'github' | 'upload' | 'preset';

type AnalyzeApiResponse = {
  graph: DependencyGraph;
  report: BlastRadiusReport;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FONT_MONO: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
};

interface PresetOption {
  key: string;
  label: string;
  description: string;
  tags: string[];
}

const ENTERPRISE_PRESETS: PresetOption[] = [
  {
    key: 'authSchemaBreaking',
    label: 'Auth Schema Breaking Change',
    description: 'JWT token schema renamed fields — breaks all 9 downstream consumers',
    tags: ['auth', 'jwt', 'breaking-change'],
  },
  {
    key: 'dbPoolExhaustion',
    label: 'DB Connection Pool Exhaustion',
    description: 'Shared Postgres pool starved under a burst load — cascades to billing',
    tags: ['database', 'postgres', 'performance'],
  },
  {
    key: 'monolithMigration',
    label: 'Monolith → Microservices',
    description: 'Strangler-fig split creates transient dual-write chaos on the order pipeline',
    tags: ['migration', 'architecture', 'dual-write'],
  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface RepoUploadModalProps {
  open: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Tab button
// ---------------------------------------------------------------------------

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
        active
          ? 'bg-violet-900/50 border border-violet-500 text-violet-300'
          : 'border border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800'
      }`}
      style={FONT_MONO}
    >
      {icon}
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// GitHub URL tab
// ---------------------------------------------------------------------------

function GitHubTab({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}): React.JSX.Element {
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500" style={FONT_MONO}>
        Paste a public GitHub repository URL. DryRun will walk the file tree and build the
        dependency graph.
      </p>
      <div className="flex flex-col gap-1">
        <label htmlFor="repo-url-input" className="text-xs text-slate-400" style={FONT_MONO}>
          Repository URL
        </label>
        <input
          id="repo-url-input"
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://github.com/expressjs/express"
          className="w-full px-3 py-2 rounded-md border border-slate-600 bg-slate-900 text-slate-200 text-sm placeholder-slate-600 outline-none focus:border-violet-500 transition-colors"
          style={FONT_MONO}
          autoFocus
        />
      </div>
      <p className="text-xs text-slate-600" style={FONT_MONO}>
        Example: <code className="text-sky-500">https://github.com/expressjs/express</code> ·{' '}
        <code className="text-sky-500">https://github.com/nestjs/nest</code>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// File upload tab
// ---------------------------------------------------------------------------

function FileUploadTab({
  fileContent,
  onFileContent,
}: {
  fileContent: string;
  onFileContent: (content: string) => void;
}): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleFile = useCallback(
    (file: File): void => {
      setError('');
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          onFileContent(content);
        }
      };
      reader.onerror = () => setError('Failed to read file.');
      reader.readAsText(file);
    },
    [onFileContent],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500" style={FONT_MONO}>
        Upload a JSON file-tree map (
        <code className="text-sky-500">{`{"path/to/file.ts": "content…"}`}</code>) or a plain
        text listing of file paths.
      </p>

      {/* Drop zone */}
      <div
        className="flex flex-col items-center justify-center gap-3 px-4 py-8 rounded-md border-2 border-dashed border-slate-600 hover:border-violet-500 bg-slate-800/30 cursor-pointer transition-colors"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Drop file or click to upload"
      >
        <Upload className="h-8 w-8 text-slate-600" />
        {fileName ? (
          <p className="text-xs text-emerald-400" style={FONT_MONO}>
            ✓ {fileName}
          </p>
        ) : (
          <>
            <p className="text-xs text-slate-500" style={FONT_MONO}>
              Drop a .json or .txt file here, or click to browse
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".json,.txt,.text"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {error && (
        <p className="text-xs text-red-400" style={FONT_MONO}>
          {error}
        </p>
      )}

      {fileContent && (
        <div className="rounded-md border border-slate-700 bg-[#020617] p-3 max-h-24 overflow-y-auto">
          <pre className="text-xs text-slate-500 leading-relaxed" style={FONT_MONO}>
            {fileContent.slice(0, 300)}
            {fileContent.length > 300 ? '\n…' : ''}
          </pre>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preset tab
// ---------------------------------------------------------------------------

function PresetTab({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (key: string) => void;
}): React.JSX.Element {
  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500" style={FONT_MONO}>
        Select a built-in enterprise preset to instantly load a realistic dependency graph.
      </p>
      {ENTERPRISE_PRESETS.map((preset) => (
        <button
          key={preset.key}
          type="button"
          onClick={() => onSelect(preset.key)}
          className={`w-full flex items-start gap-3 px-3 py-3 rounded-md border text-left transition-colors ${
            selected === preset.key
              ? 'border-violet-500 bg-violet-900/30'
              : 'border-slate-700 bg-slate-800/40 hover:border-slate-500'
          }`}
        >
          <Database
            className={`h-4 w-4 mt-0.5 shrink-0 ${
              selected === preset.key ? 'text-violet-400' : 'text-slate-600'
            }`}
          />
          <div className="min-w-0">
            <p
              className={`text-xs font-semibold ${selected === preset.key ? 'text-violet-300' : 'text-slate-200'}`}
              style={FONT_MONO}
            >
              {preset.label}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug" style={FONT_MONO}>
              {preset.description}
            </p>
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {preset.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 rounded text-xs bg-slate-800 border border-slate-700 text-slate-500"
                  style={FONT_MONO}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          {selected === preset.key && (
            <CheckCircle2 className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
          )}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function RepoUploadModal({ open, onClose }: RepoUploadModalProps): React.JSX.Element | null {
  const { loadGraph, startSimulation, setPreset } = useSimulation();

  const [mode, setMode] = useState<IngestionMode>('preset');
  const [githubUrl, setGithubUrl] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('authSchemaBreaking');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = useCallback((): void => {
    if (!loading) onClose();
  }, [loading, onClose]);

  const handleIngest = useCallback(async (): Promise<void> => {
    setError('');
    setLoading(true);

    try {
      if (mode === 'preset') {
        // Fast-path: use local fixture, no network call needed
        const fixtureKey = selectedPreset as keyof typeof FIXTURE_SCENARIOS;
        const fixture = FIXTURE_SCENARIOS[fixtureKey];
        if (!fixture) {
          setError(`Unknown preset: ${selectedPreset}`);
          return;
        }
        const presetAsPresetKey = selectedPreset as 'authSchemaBreaking' | 'dbPoolExhaustion';
        if (presetAsPresetKey === 'authSchemaBreaking' || presetAsPresetKey === 'dbPoolExhaustion') {
          setPreset(presetAsPresetKey);
        }
        loadGraph(fixture.blastReport.graph, fixture.blastReport);
        const depths = Object.values(fixture.blastReport.impacts).map((i) => i.blastDepth);
        const maxDepth = depths.length > 0 ? Math.max(...depths) : 0;
        startSimulation(fixture.chaosResult, maxDepth + 2);
        onClose();
        return;
      }

      // --- Build request body for API ---
      const bodyBase: Record<string, unknown> = {};

      if (mode === 'github') {
        if (!githubUrl.trim()) {
          setError('Please enter a GitHub repository URL.');
          return;
        }
        bodyBase.repoUrl = githubUrl.trim();
      } else if (mode === 'upload') {
        if (!fileContent.trim()) {
          setError('Please upload a file first.');
          return;
        }
        // Try parsing as JSON file-tree; fall back to path list
        let parsedTree: Record<string, string> | null = null;
        try {
          const parsed: unknown = JSON.parse(fileContent);
          if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
            parsedTree = parsed as Record<string, string>;
          }
        } catch {
          // Build synthetic tree from line-delimited paths
          const lines = fileContent
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l.length > 0);
          parsedTree = Object.fromEntries(lines.map((p) => [p, '']));
        }
        bodyBase.fileTree = parsedTree;
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyBase),
      });

      if (!res.ok) {
        const errBody = (await res.json()) as { error?: string };
        throw new Error(errBody.error ?? `HTTP ${res.status}`);
      }

      const data = (await res.json()) as AnalyzeApiResponse;
      loadGraph(data.graph, data.report);

      // Auto-start a pass-through simulation using blast report data
      const depths = Object.values(data.report.impacts).map((i) => i.blastDepth);
      const maxDepth = depths.length > 0 ? Math.max(...depths) : 0;

      // Build a minimal ChaosSimulationResult from the blast report so the
      // visualizer can render without a separate /api/simulate call
      const { randomUUID } = await import('crypto').catch(() => ({
        randomUUID: (): string => Math.random().toString(36).slice(2),
      }));

      const minimalChaosResult = {
        runId: typeof randomUUID === 'function' ? randomUUID() : Math.random().toString(36).slice(2),
        blastRadiusReport: data.report,
        scenarios: [],
        nodeResults: Object.fromEntries(
          Object.keys(data.report.impacts).map((id) => [
            id,
            {
              nodeId: id,
              failureProbability: (data.report.impacts[id]?.impactScore ?? 0) / 100,
              estimatedLatencyMultiplier: 1 + (data.report.impacts[id]?.impactScore ?? 0) / 100,
              affectedByScenarios: [],
            },
          ]),
        ),
        criticalFailureChain: data.report.topRiskyNodes.slice(0, 5),
        aggregateRiskScore: data.report.overallBlastScore,
        simulatedAt: new Date().toISOString(),
      };

      startSimulation(minimalChaosResult, maxDepth + 2);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error during ingestion.');
    } finally {
      setLoading(false);
    }
  }, [mode, githubUrl, fileContent, selectedPreset, loadGraph, startSimulation, setPreset, onClose]);

  if (!open) return null;

  const canSubmit =
    !loading &&
    ((mode === 'github' && githubUrl.trim().length > 0) ||
      (mode === 'upload' && fileContent.trim().length > 0) ||
      mode === 'preset');

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Custom Repository Ingestion"
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-2">
            <Github className="h-4 w-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-slate-200" style={FONT_MONO}>
              Ingest Repository
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-200 transition-colors"
            aria-label="Close"
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 px-5 pt-4">
          <TabButton
            active={mode === 'preset'}
            onClick={() => setMode('preset')}
            icon={<Database className="h-3.5 w-3.5" />}
            label="Enterprise Presets"
          />
          <TabButton
            active={mode === 'github'}
            onClick={() => setMode('github')}
            icon={<Github className="h-3.5 w-3.5" />}
            label="GitHub URL"
          />
          <TabButton
            active={mode === 'upload'}
            onClick={() => setMode('upload')}
            icon={<Upload className="h-3.5 w-3.5" />}
            label="File Upload"
          />
        </div>

        {/* Tab content */}
        <div className="px-5 py-4">
          {mode === 'preset' && (
            <PresetTab selected={selectedPreset} onSelect={setSelectedPreset} />
          )}
          {mode === 'github' && (
            <GitHubTab value={githubUrl} onChange={setGithubUrl} />
          )}
          {mode === 'upload' && (
            <FileUploadTab fileContent={fileContent} onFileContent={setFileContent} />
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-5 mb-2 flex items-center gap-2 px-3 py-2 rounded-md border border-red-800 bg-red-900/30 text-red-400 text-xs">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span style={FONT_MONO}>{error}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-700 shrink-0">
          <p className="text-xs text-slate-600" style={FONT_MONO}>
            {mode === 'preset'
              ? 'Loads instantly — no network required'
              : mode === 'github'
              ? 'Requires network access to GitHub'
              : 'Local analysis — no upload'}
          </p>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => { void handleIngest(); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
            style={FONT_MONO}
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Ingesting…
              </>
            ) : (
              <>
                Analyse
                <ChevronRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}


### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Explore existing codebase structure and read relevant files
[x] Build TelemetryDrawer component
[x] Build ReleaseNotesModal component
[x] Build RepoUploadModal component
[-] Wire all three components into analyze page and top bar
[ ] Run pnpm build / tsc --noEmit and fix any errors


### 🤖 Assistant

> 🔧 called: apply_diff

Now wire all three components into [`src/app/analyze/page.tsx`](src/app/analyze/page.tsx):

> 🔧 **apply_diff** — src/app/analyze/page.tsx

### 🤖 Assistant

> 🔧 called: update_todo_list

Now run the TypeScript check to catch any errors:

> 🔧 **update_todo_list** — 
[x] Explore existing codebase structure and read relevant files
[x] Build TelemetryDrawer component
[x] Build ReleaseNotesModal component
[x] Build RepoUploadModal component
[x] Wire all three components into analyze page and top bar
[-] Run pnpm build / tsc --noEmit and fix any errors


### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — pnpm tsc --noEmit 2>&1

### 🤖 Assistant

> 🔧 called: read_file

The `PhaseKey` type doesn't include `'IDLE'`. Fix the guard in the hook:

> 🔧 **read_file** — src/components/TelemetryDrawer.tsx

### 🤖 Assistant

> 🔧 called: apply_diff

The fix: cast to `SimulationPhase` instead of `PhaseKey`, and check `IDLE` before the cast:

> 🔧 **apply_diff** — src/components/TelemetryDrawer.tsx

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — pnpm tsc --noEmit 2>&1

### 🤖 Assistant

> 🔧 called: execute_command

TypeScript passes clean. Now run the full build:

> 🔧 **execute_command** — pnpm build 2>&1

### 🤖 Assistant

> 🔧 called: update_todo_list

Build passes clean. Let me mark the final task complete:

> 🔧 **update_todo_list** — 
[x] Explore existing codebase structure and read relevant files
[x] Build TelemetryDrawer component
[x] Build ReleaseNotesModal component
[x] Build RepoUploadModal component
[x] Wire all three components into analyze page and top bar
[x] Run pnpm build / tsc --noEmit and fix any errors


### 🤖 Assistant

All three features are live and the build is clean (`pnpm tsc --noEmit` ✓, `pnpm build` ✓). Here's a summary of what was added:

---

### What was built

#### [`src/components/TelemetryDrawer.tsx`](src/components/TelemetryDrawer.tsx)
A collapsible bottom drawer pinned below the canvas. It auto-accumulates events keyed to each simulation phase transition:
- `[AST]` — file-tree walk, edge extraction, `DependencyGraph` emit
- `[BLAST]` — reverse BFS pass, impact scores, `BlastRadiusReport` ready
- `[CHAOS]` — per-tick fault injection with decay, aggregate risk score
- `[WATSONX]` — SSE stream open/close, gate decision emit

Controls: level filter pills (`ALL / INFO / WARN / ERROR`), free-text search, **Clear** and **Export Logs (.json)** buttons. An animated red dot appears when any ERROR-level event is present.

#### [`src/components/ReleaseNotesModal.tsx`](src/components/ReleaseNotesModal.tsx)
A centred modal with four sections derived directly from live simulation state:
1. **Impacted Services & APIs** — top-risk nodes with scores and critical-path flags
2. **High-Risk Dependency Changes** — changed / added / deleted files from the change set
3. **Pre-Release Testing Matrix** — critical failure chain with failure probability and priority
4. **Rollback Runbook** — step-by-step shell commands from the gate decision

**Copy Markdown** button builds the full document and copies it to clipboard for GitHub PR bodies or Slack incident channels.

#### [`src/components/RepoUploadModal.tsx`](src/components/RepoUploadModal.tsx)
Three ingestion modes on a tabbed interface:
- **Enterprise Presets** — instant local fixture load (no network), routes directly to `loadGraph` + `startSimulation`
- **GitHub URL** — POSTs `repoUrl` to `/api/analyze`, receives graph + blast report, builds a minimal `ChaosSimulationResult` for visualisation
- **File Upload** — drag-and-drop JSON file-tree or newline-delimited path list; same API flow

#### [`src/app/analyze/page.tsx`](src/app/analyze/page.tsx) — wiring
- Two new icon buttons added to the top bar: **Ingest Repo** (`FolderSearch`) and **Release Notes** (`FileText`)
- `TelemetryHeader` receives two additional callbacks (`onOpenReleaseNotes`, `onOpenRepoUpload`)
- `TelemetryDrawer` rendered between the main content area and the gate slide-over
- All three modals mounted at the bottom of `WorkspaceInner` alongside `GateReport`