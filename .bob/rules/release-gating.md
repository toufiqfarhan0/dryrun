# Bob IDE Custom Rules: Pre-Flight Release Gating & DORA Compliance

## Objective Gating Policy
- **Risk Score Formula:**
  - `Risk Score = (0.35 × Max Blast Radius Depth) + (0.30 × Dependent Fan-In Count) + (0.20 × Vulnerability Severity) + (0.15 × Cyclomatic Complexity / LOC)`
- **Gate Verdicts:**
  - `0 – 39:` **CLEARED (PASSED)** — Deployment safe to proceed to staging and production.
  - `40 – 69:` **NEEDS REVIEW (WARN)** — Deployment requires lead engineer sign-off and enhanced telemetry monitoring.
  - `70 – 100:` **BLOCKED (CRITICAL RISK)** — Automatic hard gate blockage. High cascading blast radius, database connection exhaustion risk, or security vulnerability detected.
- **Regulatory Alignment:**
  - Meets EU Digital Operational Resilience Act (DORA Regulation 2022/2554) Chapter II ICT risk management and change control requirements.
