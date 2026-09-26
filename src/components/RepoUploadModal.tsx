'use client';

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
