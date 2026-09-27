# Bob IDE Custom Rules: Coding Standards
Applied across all AI agent interactions in the DryRun repository.

## Language & Type Safety
- **Strict TypeScript 5:** Strict mode enabled at all times. Zero `any` types permitted.
- **Contract Enforcement:** All external payloads, API responses, and simulation results must validate against shared Zod schemas and TypeScript interfaces in `src/types/index.ts`.
- **Pure Neo-Brutalist Light Mode:** Design tokens utilize `#f6f5f2` warm neutral stone background, `#ffffff` card surfaces, crisp `#000` 1.5–2px borders, and solid hard shadows (`box-shadow: 3px 3px 0 0 #000`).
- **Zero Build Warnings:** `tsc --noEmit` and `npm run build` must succeed with 0 errors and 0 warnings.
