# Role: Core Architecture & Data Specifier
Context: We are standardizing the exact data contracts and scenario engine for DryRun to match our pre-flight release simulation architecture.

Please execute the following updates:

1. Install Required Dependencies:
   Add and install the following packages in `package.json`:
   - `framer-motion` (for smooth layout and screen transitions)
   - `adm-zip` and `@types/adm-zip` (for server-side repository ZIP extraction)
   - `jszip` (for client-side archive handling)
   - `@ibm-cloud/watsonx-ai` and `dotenv`
   - `lucide-react`

2. Standardize Core Types (`src/types/index.ts`):
   Define the exact types used across the entire application:
   ```typescript
   export type RiskLevel = 'ok' | 'warn' | 'danger'
   export type Severity = 'low' | 'medium' | 'high' | 'critical'
   export type IssueType = 'performance' | 'security' | 'architecture'
   export type EventType = 'normal' | 'warn' | 'danger'
   export type Screen = 'upload' | 'processing' | 'dashboard'
   export type StatusType = 'IDLE' | 'ANALYZING' | 'ACTIVE' | 'DEGRADING' | 'CRITICAL FAILURE'

   export interface Module {
     name: string
     risk: RiskLevel
     files: number
     x?: number
     y?: number
   }

   export interface Issue {
     type: IssueType
     severity: Severity
     description: string
     impact: string
   }

   export interface SimulationEvent {
     time: string
     event: string
     type: EventType
   }

   export interface AIResult {
     projectName?: string
     stack?: string[]
     modules?: Module[]
     risk_score: number
     summary: string
     issues: Issue[]
     simulation: SimulationEvent[]
   }

   export interface ProjectData {
     projectName: string
     modules: Module[]
     stack: string[]
     aiResult: AIResult
   }

   export interface StatusConfig {
     text: StatusType
     color: string
   }

---

**Status:** active  **Date:** 2026-09-26

---

### 👤 User

Role: Core Architecture & Data Specifier
Context: We are standardizing the exact data contracts and scenario engine for DryRun to match our pre-flight release simulation architecture.

Please execute the following updates:

1. Install Required Dependencies:
   Add and install the following packages in `package.json`:
   - `framer-motion` (for smooth layout and screen transitions)
   - `adm-zip` and `@types/adm-zip` (for server-side repository ZIP extraction)
   - `jszip` (for client-side archive handling)
   - `@ibm-cloud/watsonx-ai` and `dotenv`
   - `lucide-react`

2. Standardize Core Types (`src/types/index.ts`):
   Define the exact types used across the entire application:
   ```typescript
   export type RiskLevel = 'ok' | 'warn' | 'danger'
   export type Severity = 'low' | 'medium' | 'high' | 'critical'
   export type IssueType = 'performance' | 'security' | 'architecture'
   export type EventType = 'normal' | 'warn' | 'danger'
   export type Screen = 'upload' | 'processing' | 'dashboard'
   export type StatusType = 'IDLE' | 'ANALYZING' | 'ACTIVE' | 'DEGRADING' | 'CRITICAL FAILURE'

   export interface Module {
     name: string
     risk: RiskLevel
     files: number
     x?: number
     y?: number
   }

   export interface Issue {
     type: IssueType
     severity: Severity
     description: string
     impact: string
   }

   export interface SimulationEvent {
     time: string
     event: string
     type: EventType
   }

   export interface AIResult {
     projectName?: string
     stack?: string[]
     modules?: Module[]
     risk_score: number
     summary: string
     issues: Issue[]
     simulation: SimulationEvent[]
   }

   export interface ProjectData {
     projectName: string
     modules: Module[]
     stack: string[]
     aiResult: AIResult
   }

   export interface StatusConfig {
     text: StatusType
     color: string
   }

---

### 🤖 Assistant

> 🔧 called: list_files



> 🔧 **list_files** — .

### 🤖 Assistant

> 🔧 called: read_file, glob



> 🔧 **read_file** — package.json

> 🔧 **glob** — src/types/**/*

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — [-] Install missing dependencies (framer-motion, adm-zip, @types/adm-zip, jszip, @ibm-cloud/watsonx-ai, dotenv)
[ ] Create src/types/index.ts with standardized core types


### 🤖 Assistant

> 🔧 called: execute_command

`lucide-react` and `dotenv` are already present (lucide-react in dependencies, dotenv needs adding). Installing the 5 missing packages now:

> 🔧 **execute_command** — pnpm add framer-motion jszip @ibm-cloud/watsonx-ai dotenv; pnpm add -D adm-zip @types/adm-zip

### 🤖 Assistant

> 🔧 called: update_todo_list

All packages installed. Now creating the types file:

> 🔧 **update_todo_list** — [x] Install missing dependencies (framer-motion, adm-zip, @types/adm-zip, jszip, @ibm-cloud/watsonx-ai, dotenv)
[-] Create src/types/index.ts with standardized core types


### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — New-Item -ItemType Directory -Force -Path src/types | Out-Null

### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — src/types/index.ts

### 🤖 Assistant

> 🔧 called: execute_command

Now run the typecheck to confirm the types file is valid:

> 🔧 **execute_command** — pnpm typecheck 2>&1

### 🤖 Assistant

> 🔧 called: write_file

The existing codebase heavily imports the prior rich contract types from `@/types`. The new contract is the application-level UI contract, but it can't replace the existing graph/blast-radius types that the entire pipeline depends on. The correct approach is to **add** the new types alongside the existing ones rather than replace them.

> 🔧 **write_file** — src/types/index.ts

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — pnpm typecheck 2>&1

### 🤖 Assistant

> 🔧 called: update_todo_list

Clean. All type errors resolved.

> 🔧 **update_todo_list** — [x] Install missing dependencies (framer-motion, adm-zip, @types/adm-zip, jszip, @ibm-cloud/watsonx-ai, dotenv)
[x] Create src/types/index.ts with standardized core types


### 🤖 Assistant

Both tasks are done. Here's what was applied:

---

### 1. Dependencies installed

| Package | Type | Notes |
|---|---|---|
| `framer-motion` | dependency | smooth layout/screen transitions |
| `jszip` | dependency | client-side archive handling |
| `@ibm-cloud/watsonx-ai` | dependency | watsonx Granite SDK |
| `dotenv` | dependency | env var loading |
| `adm-zip` | devDependency | server-side ZIP extraction |
| `@types/adm-zip` | devDependency | TS types for adm-zip |
| `lucide-react` | — | already present, no change needed |

### 2. [`src/types/index.ts`](src/types/index.ts) updated

The new UI/application-level types were **prepended as § 0** to the existing file rather than replacing it. This was required because the existing codebase (ingester, blast-radius, chaos engine, visualizer, API routes, fixtures) all import the pipeline types — `NodeId`, `GraphNode`, `DependencyGraph`, `BlastRadiusReport`, `FaultScenario`, `ChaosSimulationResult`, `ReleaseGateDecision`, Zod schemas, etc. — from the same module. Replacing those would have broken ~30 files.

The final `src/types/index.ts` now exports both layers in one place:
- **§ 0** — `RiskLevel`, `Severity`, `IssueType`, `EventType`, `Screen`, `StatusType`, `Module`, `Issue`, `SimulationEvent`, `AIResult`, `ProjectData`, `StatusConfig`
- **§ 1–6** — all existing pipeline contracts, unchanged

`pnpm typecheck` passes with zero errors.