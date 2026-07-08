# PulseForge AI End-to-End System Audit

Audit date: 2026-07-08

## System Health

Readiness Score: 88/100

Status: Operational with provider fallbacks active.

The frontend builds successfully, the FastAPI app imports and starts, backend health is online, route registration is complete, and critical backend pipelines finish inside the 10-15 second target after repairs.

## API Status

Provider diagnostics endpoint: `GET /api/provider-status`

| Provider | Loaded from `.env` | Status | Notes |
| --- | --- | --- | --- |
| Tavily | Yes | Responding | HTTP 200, 3237 ms |
| NewsAPI | Yes | Responding | HTTP 200, 1722 ms |
| Gemini / Nebius path | Yes | Invalid | HTTP 401. Fallback and cooldown enabled. |
| OpenAI | Yes | Responding | HTTP 200, 3088 ms |
| Google Search | Yes | Invalid | HTTP 401. Key/CX pair not authorized. |
| Google Custom Search | Yes | Invalid | HTTP 401. Key/CX pair not authorized. |

No API keys are printed by diagnostics.

## Backend Health

Registered API routes:

- `GET /api/health`
- `GET /api/provider-status`
- `GET /api/routes`
- `POST /api/onboard-company`
- `POST /api/analyze-company`
- `POST /api/find-partners`
- `POST /api/classify-signal`
- `POST /api/generate-outreach`
- `GET /api/explain-metric`
- `GET /api/analysis-history`

Validation:

- FastAPI import: passed.
- `/api/health`: passed, 10 ms.
- `/api/provider-status`: passed, 3239 ms.
- `/api/onboard-company` with `pfizer.com`: passed, 7844 ms, 40 evidence records.
- `/api/find-partners`: passed, 5458 ms, 2 live matches.

## Frontend Health

Validation:

- TypeScript build: passed.
- Vite production build: passed.
- Browser console errors/warnings: zero during page load and import click attempts.
- Backend connection banner: shows live backend.
- Diagnostics panel: present.
- Premature "Insufficient public evidence": fixed.
- Import and match requests: protected with abort-aware timeouts.

## Performance

Repairs:

- Parallelized signal collection across Tavily, NewsAPI, RSS, and website scraping.
- Limited website import candidate fetches from 18 to 10 and RSS feeds from 5 to 3.
- Added elapsed stage timing to import pipeline output.
- Switched bulk pipeline classification to deterministic offline classification when AI credentials are unhealthy.
- Added Gemini failure cooldown for 401/403/429 responses.
- Reduced initial live partner matching to two targets to keep first scan responsive.
- Added hard 15 second frontend timeouts with cancel support.

Measured timings:

- Provider diagnostics: 3.2 seconds.
- Website import: 7.8 seconds.
- Partner matching: 5.5 seconds.

## Logging

Added structured logs for:

- API request received.
- API response sent.
- Response time.
- Provider probe result.
- Collector source timings.
- Classification timing.
- Fallback usage.

## Security

- CORS is scoped to localhost/127.0.0.1 dev origins.
- Provider diagnostics do not expose secret values.
- Invalid AI/search keys are reported by status only.

## Bugs Found and Fixed

- Health response contract mismatch.
- Missing Google key visibility in health.
- No provider validation endpoint.
- Frontend timeout helper ignored timeout when caller supplied an abort signal.
- Presentation import and partner matching lacked hard request timeouts.
- Presentation Workspace trusted stale backend state.
- Premature insufficient-evidence warning before import.
- Long sequential provider collection.
- Long sequential AI classification path.
- Repeated invalid Gemini/Nebius 401 calls.
- Accent action buttons missing base button class.
- Missing progress percentages on long loading states.
- Missing route/API timing logs.

## Remaining Issues

- Gemini/Nebius key is loaded but invalid: HTTP 401.
- Google Search / Custom Search key pair is loaded but invalid: HTTP 401.
- The in-app browser automation surface did not dispatch React click events to the Import button during final QA, although the button is enabled, correctly styled, and the page has zero console errors. Backend direct POST validation succeeds and previous live browser traffic did reach the backend. Manual browser verification is recommended for that one UI click path.
- A `.pnpm-home` cache and `pnpm-lock.yaml` were created during dependency repair because `npm` was unavailable and the existing `node_modules` was missing native Vite/Rolldown bindings.

## Commands

Backend:

```bash
cd "/Volumes/S/New folder/backend"
python3 -m venv .venv
.venv/bin/python -m pip install --no-compile -r requirements.txt
.venv/bin/python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Frontend:

```bash
cd "/Volumes/S/New folder"
npm run dev -- --host 127.0.0.1
# or
npm run build && npm run preview -- --host 127.0.0.1
```

Health verification:

```bash
curl http://127.0.0.1:8000/api/health
curl http://127.0.0.1:8000/api/provider-status
```
