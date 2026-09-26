'use client'

import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import TopBar from '@/components/TopBar'
import UploadScreen from '@/components/UploadScreen'
import ProcessingScreen, { type LogEntry } from '@/components/ProcessingScreen'
import Dashboard from '@/components/Dashboard'
import AnalyzingOverlay from '@/components/AnalyzingOverlay'
import {
  DEMO_DATA,
  DEMO_SCENARIOS,
  PROCESSING_STAGES_DEMO,
  PROCESSING_STAGES_UPLOAD,
} from '@/lib/demo-data'
import { sleep, statusColors, formatFileSize } from '@/lib/utils'
import type { Screen, StatusType, ProjectData, AIResult } from '@/types'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [screen, setScreen] = useState<Screen>('upload')
  const [status, setStatus] = useState<StatusType>('IDLE')
  const [projectName, setProjectName] = useState('no project loaded')
  const [riskScore, setRiskScore] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
    const saved = (localStorage.getItem('dryrun-theme') as 'dark' | 'light') || (localStorage.getItem('breakwater-theme') as 'dark' | 'light') || 'dark'
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
  const updateStatus = useCallback((text: StatusType, color?: string) => {
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
  const handleDemo = useCallback(async (scenarioId?: string) => {
    const selectedScenario = DEMO_SCENARIOS.find((s) => s.id === scenarioId) || DEMO_SCENARIOS[0]
    const data = selectedScenario.data
    const stages = selectedScenario.stages

    setIsDemo(true)
    setScreen('processing')
    updateStatus('ANALYZING')
    setProcLogs([])
    setProcStack([])
    setProjectName(data.projectName)

    await runStages(stages)

    data.stack.forEach((s) =>
      setProcStack((prev) => [...prev, s])
    )
    await sleep(800)

    setRiskScore(data.aiResult.risk_score)
    setDashboardData(data)
    setScreen('dashboard')
    updateStatus('ACTIVE')
  }, [runStages, updateStatus])

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
      const detectedModules = aiResult.modules ?? [
        { name: 'Main Module', risk: 'warn' as const, files: 20 },
        { name: 'API Layer', risk: 'danger' as const, files: 8 },
        { name: 'Database', risk: 'warn' as const, files: 5 },
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

      // Fire analyze request immediately so we check access without making user wait
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
          return { ok: false, status: 500, json: { error: err.message || 'Network error' } }
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
        // Repository is private, not found, or inaccessible!
        // Return to upload screen and trigger the Private Repo Popup Card
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

      // Repository is accessible and unpacked! Proceed with remaining stages
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
      const detectedModules = aiResult.modules ?? [
        { name: 'Main Service', risk: 'warn' as const, files: 15 },
        { name: 'API Router', risk: 'danger' as const, files: 8 },
        { name: 'Database', risk: 'warn' as const, files: 6 },
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
  const handleStatusChange = useCallback((text: string, color: string) => {
    setStatus(text as StatusType)
  }, [])

  const statusColor = statusColors[status] ?? '#4ade80'

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null
  }

  return (
    <div className="flex flex-col" style={{ height: '100dvh', overflow: 'hidden' }}>
      <TopBar
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

      <AnalyzingOverlay visible={analyzing} />

      <main className={`flex flex-col flex-1 min-h-0 ${screen === 'dashboard' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        <AnimatePresence mode="wait">
          {screen === 'upload' && (
            <UploadScreen
              key="upload"
              onFileSelected={handleFile}
              onDemo={handleDemo}
              onRepoUrl={handleRepoUrl}
              privateRepoNotice={privateRepoNotice}
              onClosePrivateRepoNotice={() => setPrivateRepoNotice(null)}
            />
          )}
          {screen === 'processing' && (
            <ProcessingScreen
              key="processing"
              stage={procStage}
              logs={procLogs}
              stackTags={procStack}
            />
          )}
          {screen === 'dashboard' && dashboardData && (
            <Dashboard
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
