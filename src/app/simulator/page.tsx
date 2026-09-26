'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import Navbar from '@/components/Navbar'
import RepositoryUploadScreen from '@/components/RepositoryUploadScreen'
import AnalysisProgressScreen, { type LogEntry } from '@/components/AnalysisProgressScreen'
import SimulatorDashboard from '@/components/SimulatorDashboard'
import AnalysisScanningOverlay from '@/components/AnalysisScanningOverlay'
import SimulatorLoadingSkeleton from '@/components/SimulatorLoadingSkeleton'
import {
  DEMO_DATA,
  DEMO_SCENARIOS,
  PROCESSING_STAGES_DEMO,
  PROCESSING_STAGES_UPLOAD,
} from '@/lib/simulation-scenarios'
import { sleep, statusColors, formatFileSize } from '@/lib/simulation-helpers'
import type { Screen, StatusType, ProjectData, AIResult } from '@/types'

function SimulatorContent() {
  const searchParams = useSearchParams()
  const scenarioParam = searchParams.get('scenario')

  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [screen, setScreen] = useState<Screen>('upload')
  const [status, setStatus] = useState<StatusType>('IDLE')
  const [projectName, setProjectName] = useState('no project loaded')
  const [riskScore, setRiskScore] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
    const saved =
      (localStorage.getItem('dryrun-theme') as 'dark' | 'light') ||
      (localStorage.getItem('breakwater-theme') as 'dark' | 'light') ||
      'dark'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
    if (saved === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('dryrun-theme', next)
      document.documentElement.setAttribute('data-theme', next)
      if (next === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return next
    })
  }, [])

  const [procStage, setProcStage] = useState('')
  const [procLogs, setProcLogs] = useState<LogEntry[]>([])
  const [procStack, setProcStack] = useState<string[]>([])

  const [dashboardData, setDashboardData] = useState<ProjectData | null>(null)
  const [isDemo, setIsDemo] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [privateRepoNotice, setPrivateRepoNotice] = useState<{
    isOpen: boolean
    repoUrl?: string
    error?: string
  } | null>(null)

  /* ── Helpers ── */
  const updateStatus = useCallback((text: StatusType) => {
    setStatus(text)
  }, [])

  const addLog = useCallback((text: string, type: LogEntry['type']) => {
    const ts = new Date().toISOString().slice(11, 19)
    setProcLogs((prev) => [...prev, { ts, text, type }])
  }, [])

  /* ── Run stages animation ── */
  const runStages = useCallback(
    async (stages: typeof PROCESSING_STAGES_DEMO) => {
      for (const stage of stages) {
        setProcStage(stage.msg)
        for (const log of stage.logs) {
          await sleep(400 + Math.random() * 300)
          addLog(log.text, log.type)
        }
        await sleep(600)
      }
    },
    [addLog]
  )

  /* ── Demo flow ── */
  const handleDemo = useCallback(
    async (scenarioId?: string) => {
      const selectedScenario =
        DEMO_SCENARIOS.find((s) => s.id === scenarioId) || DEMO_SCENARIOS[0]
      const data = selectedScenario.data
      const stages = selectedScenario.stages

      setIsDemo(true)
      setScreen('processing')
      updateStatus('ANALYZING')
      setProcLogs([])
      setProcStack([])
      setProjectName(data.projectName)

      await runStages(stages)

      data.stack.forEach((s) => setProcStack((prev) => [...prev, s]))
      await sleep(800)

      setRiskScore(data.aiResult.risk_score)
      setDashboardData(data)
      setScreen('dashboard')
      updateStatus('ACTIVE')
    },
    [runStages, updateStatus]
  )

  // Handle URL scenario query param on mount
  useEffect(() => {
    if (!mounted || !scenarioParam) return

    if (scenarioParam === 'fintech') {
      handleDemo('fintech')
    } else if (scenarioParam === 'commerce' || scenarioParam === 'cloud-commerce' || scenarioParam === 'ecommerce') {
      handleDemo('ecommerce')
    } else if (scenarioParam === 'sentinel' || scenarioParam === 'sentinel-gateway' || scenarioParam === 'zero-risk') {
      handleDemo('zero-risk')
    }
  }, [mounted, scenarioParam, handleDemo])

  /* ── Upload flow ── */
  const handleFile = useCallback(
    async (file: File) => {
      setIsDemo(false)
      setScreen('processing')
      updateStatus('ANALYZING')
      setProcLogs([])
      setProcStack([])
      setProjectName(file.name.replace('.zip', ''))

      const stages = PROCESSING_STAGES_UPLOAD.map((s, i) => {
        if (i === 0) {
          return {
            ...s,
            logs: [
              { text: 'Decompressing archive...', type: 'info' as const },
              {
                text: `Archive size: ${formatFileSize(file.size)}`,
                type: 'ok' as const,
              },
              { text: 'Reading file tree...', type: 'ok' as const },
            ],
          }
        }
        return s
      })

      await runStages(stages)

      // Read file as base64
      const base64: string = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) =>
          resolve((e.target?.result as string).split(',')[1])
        reader.readAsDataURL(file)
      })

      // Call AI
      setAnalyzing(true)
      addLog('Connecting to IBM WatsonX AI...', 'info')

      let aiResult: AIResult

      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileSize: (file.size / 1024).toFixed(1),
            base64Data: base64,
          }),
        })
        const json = await res.json()
        aiResult = json.result
        addLog('AI analysis complete!', 'ok')
      } catch {
        addLog('AI request failed — showing inconclusive result.', 'warn')
        aiResult = {
          projectName: file.name.replace('.zip', ''),
          stack: ['Unknown'],
          modules: [],
          risk_score: 0,
          summary:
            'Analysis could not reach the server. No risk assessment was produced. Please retry; if the failure persists, check server logs.',
          issues: [],
          simulation: [
            {
              time: 'T+0s',
              event: 'Analysis request failed before completion.',
              type: 'warn' as const,
            },
          ],
        }
      } finally {
        setAnalyzing(false)
      }

      const detectedStack = aiResult.stack ?? ['Unknown Stack']
      const detectedModules = (Array.isArray(aiResult.modules) && aiResult.modules.length > 0)
        ? aiResult.modules
        : [
            { name: 'Application Core', risk: 'ok' as const, files: 16 },
            { name: 'API Router & Handlers', risk: (aiResult.risk_score && aiResult.risk_score > 40) ? 'danger' as const : 'warn' as const, files: 12 },
            { name: 'Middleware Pipeline', risk: 'ok' as const, files: 8 },
            { name: 'Context & State Engine', risk: 'ok' as const, files: 6 },
            { name: 'Data Access Layer', risk: (aiResult.risk_score && aiResult.risk_score > 20) ? 'warn' as const : 'ok' as const, files: 5 },
            { name: 'Security & Auth Guard', risk: (aiResult.risk_score && aiResult.risk_score > 60) ? 'danger' as const : 'ok' as const, files: 3 },
          ]

      detectedStack.forEach((s) => setProcStack((prev) => [...prev, s]))
      await sleep(1200)

      const projectData: ProjectData = {
        projectName: aiResult.projectName ?? file.name.replace('.zip', ''),
        modules: detectedModules,
        stack: detectedStack,
        aiResult,
      }

      setRiskScore(aiResult.risk_score)
      setDashboardData(projectData)
      setScreen('dashboard')
      updateStatus('ACTIVE')
    },
    [runStages, addLog, updateStatus]
  )

  /* ── GitHub Repo Flow ── */
  const handleRepoUrl = useCallback(
    async (url: string) => {
      const match = url.match(/github\.com\/([^/]+)\/([^/#?]+)/i)
      const repoName = match ? match[2].replace(/\.git$/i, '') : 'github-repo'

      setIsDemo(false)
      setScreen('processing')
      updateStatus('ANALYZING')
      setProcLogs([])
      setProcStack([])
      setProjectName(repoName)

      const analyzePromise = fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: url }),
      })
        .then(async (res) => {
          const json = await res.json()
          return { ok: res.ok, status: res.status, json }
        })
        .catch((err) => {
          return {
            ok: false,
            status: 500,
            json: { error: err.message || 'Network error' },
          }
        })

      const initialStages = [
        {
          msg: 'Connecting to GitHub API...',
          logs: [
            { text: `Resolving repository ${url}...`, type: 'info' as const },
            { text: 'Streaming repository archive...', type: 'ok' as const },
          ],
        },
      ]

      await runStages(initialStages)

      const response = await analyzePromise

      if (!response.ok) {
        setScreen('upload')
        updateStatus('IDLE')
        setProjectName('')
        setPrivateRepoNotice({
          isOpen: true,
          repoUrl: url,
          error:
            response.json?.error ||
            'GitHub repository not found or is private. Only public repositories can be analyzed directly.',
        })
        return
      }

      const remainingStages = [
        {
          msg: 'Unpacking source tree...',
          logs: [
            { text: 'Unpacking source tree in memory...', type: 'ok' as const },
          ],
        },
        ...PROCESSING_STAGES_UPLOAD.slice(1),
      ]

      await runStages(remainingStages)

      const aiResult: AIResult = response.json.result
      addLog('AI analysis complete!', 'ok')

      const detectedStack = aiResult.stack ?? ['Unknown Stack']
      const detectedModules = (Array.isArray(aiResult.modules) && aiResult.modules.length > 0)
        ? aiResult.modules
        : [
            { name: 'Application Core', risk: 'ok' as const, files: 16 },
            { name: 'API Router & Handlers', risk: (aiResult.risk_score && aiResult.risk_score > 40) ? 'danger' as const : 'warn' as const, files: 12 },
            { name: 'Middleware Pipeline', risk: 'ok' as const, files: 8 },
            { name: 'Context & State Engine', risk: 'ok' as const, files: 6 },
            { name: 'Data Access Layer', risk: (aiResult.risk_score && aiResult.risk_score > 20) ? 'warn' as const : 'ok' as const, files: 5 },
            { name: 'Security & Auth Guard', risk: (aiResult.risk_score && aiResult.risk_score > 60) ? 'danger' as const : 'ok' as const, files: 3 },
          ]

      detectedStack.forEach((s) => {
        setProcStack((prev) => (prev.includes(s) ? prev : [...prev, s]))
      })
      await sleep(600)

      const projectData: ProjectData = {
        projectName: aiResult.projectName ?? repoName,
        modules: detectedModules,
        stack: detectedStack,
        aiResult,
      }

      setRiskScore(aiResult.risk_score)
      setDashboardData(projectData)
      setScreen('dashboard')
      updateStatus('ACTIVE')
    },
    [runStages, addLog, updateStatus]
  )

  /* ── Reset ── */
  const handleReset = useCallback(() => {
    setScreen('upload')
    setStatus('IDLE')
    setProjectName('no project loaded')
    setRiskScore(null)
    setProcLogs([])
    setProcStack([])
    setDashboardData(null)
  }, [])

  /* ── Status change from timeline ── */
  const handleStatusChange = useCallback((text: string) => {
    setStatus(text as StatusType)
  }, [])

  const statusColor = statusColors[status] ?? '#4ade80'

  if (!mounted) {
    return <SimulatorLoadingSkeleton theme={theme} />
  }

  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: theme === 'dark' ? '#0e0e0d' : '#f6f5f2',
        color: theme === 'dark' ? '#f4f4f5' : '#141413',
        fontFamily: "var(--font-sans), 'Geist', sans-serif",
      }}
    >
      <Navbar
        currentPage="simulator"
        status={status}
        statusColor={statusColor}
        projectName={projectName}
        riskScore={riskScore}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenPrivateRepoHelp={() => setPrivateRepoNotice({ isOpen: true })}
        onSelectDemo={() => {
          if (screen !== 'upload') setScreen('upload')
        }}
      />

      <AnalysisScanningOverlay visible={analyzing} />

      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          overflowY: screen === 'dashboard' ? 'hidden' : 'auto',
          position: 'relative',
          justifyContent: screen === 'dashboard' ? 'flex-start' : 'center',
          alignItems: screen === 'dashboard' ? 'stretch' : 'center',
        }}
      >
        <AnimatePresence mode="wait">
          {screen === 'upload' && (
            <RepositoryUploadScreen
              key="upload"
              onFileSelected={handleFile}
              onDemo={handleDemo}
              onRepoUrl={handleRepoUrl}
              privateRepoNotice={privateRepoNotice}
              onClosePrivateRepoNotice={() => setPrivateRepoNotice(null)}
            />
          )}
          {screen === 'processing' && (
            <AnalysisProgressScreen
              key="processing"
              stage={procStage}
              logs={procLogs}
              stackTags={procStack}
            />
          )}
          {screen === 'dashboard' && dashboardData && (
            <SimulatorDashboard
              key="dashboard"
              data={dashboardData}
              isDemo={isDemo}
              onStatusChange={handleStatusChange}
              onReset={handleReset}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default function SimulatorPage() {
  return (
    <Suspense fallback={<SimulatorLoadingSkeleton theme="dark" />}>
      <SimulatorContent />
    </Suspense>
  )
}
