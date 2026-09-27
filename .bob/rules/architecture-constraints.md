# Bob IDE Custom Rules: Architecture Constraints

## Next.js 15 App Router Architecture
- **Route Handlers:** API routes live exclusively under `src/app/api/` using Web Request/Response conventions.
- **In-Memory Zero-Disk Ingestion:** Repository archives (`.zip`) are decompressed and parsed entirely in memory using `adm-zip` buffer streams. No files are extracted to local disk, guaranteeing multi-tenant security and zero persistent disk footprint.
- **Dual-Engine Resilience:** All analysis routes must support seamless fallback:
  1. Primary: **IBM watsonx.ai Granite 3.3 8B** via IAM Bearer authentication and prompt synthesis.
  2. Fallback: Deterministic static analyzer engine when offline or unconfigured.
- **3D Spatial Engine:** Canvas rendering in `CodebaseCity.tsx` and `DeploymentCity.tsx` uses native 2D HTML5 Canvas context with isometric axonometric projection (2:1 ratio) and requestAnimationFrame loops.
