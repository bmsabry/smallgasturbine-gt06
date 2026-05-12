# GT-06 — Evaporative Tube Combustor Learning Module

Login-gated interactive learning module for the GT-06 session of ProReadyEngineer's *Small Jet Engine Design Training*.

Live at: **smallgasturbine.gt-06.proreadyengineer.com**

## Stack

- Vite 8 + React 19 (static SPA)
- Authenticates against `combustion-toolkit-api.onrender.com` via JWT
- Per-user progress stored server-side; cross-device by design
- Hosted on Cloudflare Workers + Static Assets

## Course content

12 sections, ~3.5 hr session covering combustion fundamentals, evaporative vs pressure-jet atomization, walking-stick vaporization mechanism, zonation, ignition architecture, governing equations, design workflow, a full worked example (compressor exit → fuel flow → air split → reference area → liner geometry → dilution hole sizing), practical checks, and common mistakes.

## Access model

GT-05 enrollees automatically receive GT-06 access via the backend's
`_AUTO_GRANT_ON_ACCEPT` cascade.

## Local dev

```
npm install
npm run dev
```
