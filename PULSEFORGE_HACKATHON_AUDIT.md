# PulseForge AI Hackathon Audit

Audit date: 2026-07-08  
Scope: local codebase, running frontend preview at `http://127.0.0.1:4173`, running FastAPI backend at `http://127.0.0.1:8000`, backend `.env`, build/lint checks, and representative live API workflows.

## 1. Executive Summary

PulseForge AI is a strong national-hackathon concept with a working React interface, a FastAPI intelligence backend, real public-signal ingestion, explainability surfaces, partnership scoring, business twin views, scenario simulation, and action generation. It demonstrates the Signals Harvesting Engine idea better than an ordinary dashboard because it connects signal collection, classification, scoring, recommendations, and outbound action artifacts.

It is not yet winner-level. The main blockers are evidence reliability, environment portability, lint/source hygiene, and several UI actions that simulate success instead of producing real artifacts. Live tests showed Tavily, NewsAPI, and OpenAI responding, but Gemini and Google Search/Custom Search fail with 401. Backend endpoints work when run under the bundled Python 3.12 environment, but the project `.venv` is Windows-style and cannot run on this macOS workspace. The frontend builds successfully and initial browser load has zero console warnings/errors.

Overall Score: **75 / 100**

Expected Hackathon Rank: **Top 20**, with **Top 10 potential** if the final demo avoids weak evidence examples and the environment is pre-started.

## 2. Validation Evidence

Commands/checks performed:

| Check | Result |
|---|---|
| TypeScript build | Pass: `tsc -b` |
| Vite production build | Pass: `vite build`, 1791 modules, JS bundle ~425.54 kB |
| FastAPI health | Pass: `/api/health` HTTP 200 in ~0.003s |
| Route registration | Pass: 10 `/api/*` routes registered |
| Provider diagnostics | Partial: 3 of 6 providers responding |
| Frontend initial console | Pass: no browser `error` or `warn` logs on initial page |
| Lint | Fail: non-UTF8 `._*` macOS metadata files plus unused imports/hook warnings |
| Onboard workflow | Pass but noisy: `/api/onboard-company` completed in ~5.38s |
| Analyze company | Pass but evidence quality mixed: `/api/analyze-company` completed in ~4.11s |
| Partnership matcher | Pass: `/api/find-partners` completed in ~7.19s |
| Classify signal | Pass: `/api/classify-signal` completed in ~2.25s |
| Negative API validation | Pass: missing website/title returns HTTP 400 |

## 3. Bug Audit

| Severity | Location | Impact | Recommended Fix |
|---|---|---|---|
| High | `backend/.env`, `backend/app/services/provider_diagnostics.py` | `GEMINI_API_KEY`, `GOOGLE_API_KEY`, and `GOOGLE_CX` appear to contain `AQ.`-style values. Provider diagnostics report Gemini, Google Search, and Google Custom Search as HTTP 401. AI and Google search features cannot be trusted live. | Put correct Gemini API key in `GEMINI_API_KEY`, correct Google API key in `GOOGLE_API_KEY`, and actual Custom Search Engine ID in `GOOGLE_CX`. Add format validation before startup. |
| High | `.venv/` | Local `.venv` is Windows-style (`Scripts/python.exe`, `pydantic_core.cp312-win_amd64.pyd`). On macOS, system startup with Python 3.14 fails with `ModuleNotFoundError: pydantic_core._pydantic_core`. | Recreate `.venv` per platform, do not ship binary venvs, document/use Python 3.12, pin backend dependencies. |
| High | `backend/app/services/evidence_importer.py:164` | Evidence extraction treats any page keyword hit as valid evidence. Pfizer import produced industry/product/customer fields from navigation text and menu fragments. | Add boilerplate stripping, field-specific extraction, minimum semantic relevance, and source-section ranking. Do not use generic nav text as profile fields. |
| High | `backend/app/services/signal_collector.py`, `/api/explain-metric` output | NewsAPI returned off-target articles that affected Pfizer scoring, including an ETF article and an unrelated Indian healthcare article. | Filter NewsAPI results by company/ticker/domain relevance before classification and before metric scoring. |
| Medium | `src/components/OpportunityMap.tsx:745-795` | Buttons such as Report, Monitor, Compare, Export show flash messages but do not generate PDF, start monitoring, open comparison, or export data. Judges may view these as dead/simulated actions. | Connect each button to actual Action Hub/report/export flows or label them as preview-only. |
| Medium | `src/components/PresentationWorkspace.tsx:98-103` | Import request timeout is 15s, which is good, but there is no visible cancel control during import despite the presence of `AbortController`. | Add visible Cancel button in import loading state and preserve partial pipeline status after failure. |
| Medium | `src/components/OpportunityMap.tsx:283` | Lint reports missing React hook dependencies for ecosystem recalculation. Stale map state can occur when selected node or node data changes. | Include dependencies or refactor derived ecosystem state. |
| Medium | `src/App.tsx:152-153` | Unused presentation state remains. Low runtime impact, but hurts polish and lint signal. | Remove unused state or wire it to the demo controller. |
| Medium | `src/components/*`, `src/agents/*` | Multiple unused imports reported by `oxlint`, especially in `OpportunityMap`, `CompanyTwinHeader`, `SignalStream`, `DashboardGrid`, `StrategySimulator`, and `PartnershipMatchEngine`. | Clean imports before judging; lint should pass. |
| Medium | `src/._*`, `src/components/._*`, `src/lib/._api.ts` | AppleDouble metadata files are scanned as source and fail UTF-8 lint parsing. | Delete `._*` files and add ignore rules. |
| Low | Browser automation click sweep | Initial browser console was clean, but a navigation click automation attempt timed out. This is not a confirmed user-facing bug, but it limits live-click audit confidence. | Add stable `data-testid` attributes for critical nav/buttons to make QA deterministic. |

## 4. API Key Audit

Secrets were not printed. Values below are masked from local presence checks and live diagnostics.

| Key | Present in `backend/.env` | Loaded by backend | Used in code | Live API result | Fallback behavior | Frontend exposure |
|---|---:|---:|---:|---|---|---|
| `TAVILY_API_KEY=tvly****DlpC` | Yes | Yes | Yes: Tavily service, signal collector, provider diagnostics | Success, HTTP 200, ~2194ms | Collector continues without Tavily on failure | Not exposed in frontend source |
| `NEWS_API_KEY=d355****7707` | Yes | Yes | Yes: NewsAPI service, signal collector, diagnostics | Success, HTTP 200, ~1129ms | Collector continues without NewsAPI on failure | Not exposed in frontend source |
| `GEMINI_API_KEY=AQ.A****7kEA` | Yes | Yes | Yes: Gemini service, classifier, prediction, partnership intelligence | Invalid, HTTP 401, ~1286ms | Gemini failure is marked disabled for 300s in shared service; classifier can fall back to OpenAI/offline | Not exposed in frontend source |
| `OPENAI_API_KEY=sk-p****ExsA` | Yes | Yes | Yes: signal classifier fallback, diagnostics | Success, HTTP 200, ~1859ms | Offline classifier fallback if OpenAI fails | Not exposed in frontend source |
| `GOOGLE_API_KEY=AQ.A****7kEA` | Yes | Yes | Yes: Google search service, diagnostics | Invalid, HTTP 401, ~587ms | Google search service returns empty list when unusable | Not exposed in frontend source |
| `GOOGLE_CX=AQ.A****7kEA` | Yes | Yes | Yes: Google custom search service, diagnostics | Invalid, HTTP 401, ~758ms | Google search service returns empty list when unusable | Not exposed in frontend source |

Key conclusion: all requested variables are present and loaded, but Gemini and Google values are not valid for their providers. Google fields are almost certainly wrong values.

## 5. Feature Completeness Table

| Requirement | Status | Evidence |
|---|---|---|
| Signal Collection Agent | Fully satisfied | Tavily, NewsAPI, RSS, and website collector paths exist; `collect_signals` runs providers in parallel. |
| Intent Analysis Agent | Fully satisfied | `signal_classifier.py` classifies signals with Gemini/OpenAI/offline fallback. |
| Prioritization Agent | Partially satisfied | Partnership scoring and metric weighting exist, but relevance filtering is weak. |
| Automation Agent | Partially satisfied | Action Hub generates outreach/CRM/brief content, but many actions simulate sending/creating. |
| Intelligence Dashboard | Fully satisfied | Business Twin dashboard, signal stream, evidence explorer, ecosystem map, simulator. |
| AI lead scoring | Fully satisfied | Partnership matcher returns compatibility, fit dimensions, confidence, evidence. |
| Automated workflows | Partially satisfied | Pipeline flows are connected, but external side-effect workflows are mocked. |
| CRM/action generation | Partially satisfied | CRM notes and outreach are generated; no real CRM integration. |
| Opportunity intelligence dashboard | Fully satisfied | DashboardGrid and OpportunityMap cover opportunity, risk, ecosystem, and predictions. |
| Agentic automation pipeline | Partially satisfied | Sequential workflow exists, provider fallbacks exist, but true autonomous multi-agent orchestration is mostly represented through UI and deterministic services. |

## 6. Workflow Audit

| Workflow Step | Status | Live/Cached/Fallback | Notes |
|---|---|---|---|
| 1. Open landing page | Works | Local preview | App opens directly into Presentation Workspace, not a marketing landing page. Good for demo. |
| 2. Launch platform | Works | Local preview | Sidebar navigation and header load; initial console clean. |
| 3. Import company from website | Works, noisy | Live website scrape | Pfizer import completed in ~5.38s with 72 evidence records, but extracted profile fields were polluted by nav text. |
| 4. Build Business Twin | Works | Live + deterministic scoring | Twin generated with confidence/evidence counts; field quality varies. |
| 5. Run Partnership Matcher | Works | Live providers + fallback logic | Completed in ~7.19s; returned Pfizer and Tesla matches with evidence and outreach. |
| 6. Inspect Evidence Explorer | Partially works | Uses imported evidence | Requires a successful import; otherwise likely empty/low-evidence state. |
| 7. Click Signal Intelligence | Works by source review | Local in-memory signals | Manual signal injection exists; live click sweep could not be fully completed due browser automation timeout. |
| 8. Inject/analyze new signal | Works | Frontend local classifier and backend classifier | Backend classify endpoint returned HTTP 200 in ~2.25s. |
| 9. Open Strategic Ecosystem | Partially works | Mostly static/generated local graph | Graph is interactive, but several action buttons are flash-only. |
| 10. Run Scenario Simulator | Works by source review | Local simulation | Has timeout and recovers; outputs simulation-driven signals. |
| 11. Generate Action Hub payload | Partially works | Local generated actions | Copy/status behavior exists; external dispatch is simulated. |
| 12. Use Presentation Workspace | Works | Live backend health + import | Strong demo control surface; import timeout exists. |

## 7. Agentic AI Audit

| Agent/Engine | Implemented | Actual Function | Input | Output | Evidence Usage | Limitations |
|---|---:|---|---|---|---|---|
| Signal Collector | Yes | Parallel Tavily, NewsAPI, RSS, website scrape | Company name, website, ticker | Raw public signals | URLs, snippets, provider labels | Needs stricter relevance filtering. |
| Evidence Validator / Importer | Yes | Website crawl, sitemap/robots/RSS discovery, evidence DB build | Website URL | Sources, evidence records, Business Twin | Evidence IDs, URLs, snippets, confidence | Over-classifies boilerplate/nav text. |
| Intent Classifier | Yes | Gemini/OpenAI/offline category classifier | Title + content | Category, confidence, impact, reasoning | Uses direct content snippet | Gemini branch fails for `AQ.` key in classifier because it always calls Gemini endpoint, not Nebius. |
| Business Twin Engine | Yes | Converts classified signals into company metrics/timeline/memory | Company ID + signals | Twin metrics, explainability, timeline | Signal-level explainability | Metric scores can be contaminated by irrelevant signals. |
| Partnership Matcher | Yes | Fit scoring across business/tech/market/geo/growth/cyber | User profile + target twin | Match score and explanations | Candidate evidence list | Evaluates only first two baseline targets in live backend for speed. |
| Prediction Engine | Yes | 30/60/90-day forecasts | Twin + signals | Predictions | Includes evidence object | Fallback predictions can sound generic or over-specific. |
| Explainability Engine | Yes | Metric calculation audit | Company ID + metric key | Calculation path and source list | Traceable signal effects | Can expose poor evidence relevance clearly. |
| Decision/Action Engine | Yes | Playbook, outreach, brief generation | Twin + playbook/signals | Email, LinkedIn DM, executive brief | Cites selected signal/source | Action execution is simulated in UI. |

AI hallucination risk: medium. The system often cites real URLs, but weak relevance filtering allows unrelated public signals to become “verified evidence.” This is not pure hallucination, but it produces unsupported business claims from irrelevant evidence.

## 8. UI/UX Audit

The product visually aims for Bloomberg Terminal, Palantir Foundry, and Microsoft Security Copilot. It mostly succeeds in density, technical tone, dashboard breadth, and judge-demo framing. The dark enterprise UI, sidebar navigation, pipeline terminology, evidence panels, and Business Twin concepts are credible for a hackathon setting.

Strengths:

| Area | Assessment |
|---|---|
| First impression | Strong. Opens directly to a useful Presentation Workspace. |
| Visual hierarchy | Good for desktop demo; dense but understandable. |
| Enterprise credibility | High concept quality; professional naming and evidence framing. |
| Demo clarity | Strong Presentation Workspace and Judge Demo Controller. |
| Loading states | Better than average: import/matcher have timeouts/progress/error handling. |
| Terminology | Generally coherent: signals, evidence, twin, playbook, action hub. |

Weaknesses:

| Area | Issue |
|---|---|
| Mobile/tablet | Not sufficiently verified; many layouts use fixed desktop grids such as `1fr 340px`, `1fr 380px`, and full-height panels. |
| Interaction truthfulness | Some buttons claim to generate/export/monitor but only flash messages. |
| Evidence readability | Imported raw snippets are too long and sometimes boilerplate-heavy. |
| Polish | Lint warnings and AppleDouble metadata files reduce engineering polish. |
| Accessibility/QA | Critical controls lack `data-testid`, making deterministic automated QA harder. |

## 9. Performance Audit

| Metric | Result | Verdict |
|---|---:|---|
| Frontend build | ~0.43s after cache | Pass |
| TypeScript | ~2s | Pass |
| Backend health | ~0.003s | Pass |
| Routes endpoint | ~0.001s | Pass |
| Provider diagnostics | ~2.20s | Pass |
| Classify signal | ~2.25s | Pass |
| Analyze company | ~4.11s | Pass |
| Company import | ~5.38s | Pass |
| Partnership matcher | ~7.19s | Pass |
| Tavily probe | ~2.19s | Pass |
| NewsAPI probe | ~1.13s | Pass |
| OpenAI probe | ~1.86s | Pass |
| Gemini probe | ~1.29s, HTTP 401 | Fail provider, pass timeout |
| Google probes | <1s, HTTP 401 | Fail provider, pass timeout |

No tested backend workflow exceeded 15 seconds. The app has frontend timeouts for health, import, and matching. Remaining risk is UI loading state coverage in every secondary component, not the primary tested workflows.

## 10. Backend Health Audit

Registered endpoints:

| Endpoint | Method | Status |
|---|---|---|
| `/api/health` | GET | Works |
| `/api/provider-status` | GET | Works |
| `/api/routes` | GET | Works |
| `/api/onboard-company` | POST | Works; profile extraction quality issue |
| `/api/analyze-company` | POST | Works; evidence relevance issue |
| `/api/find-partners` | POST | Works |
| `/api/classify-signal` | POST | Works |
| `/api/generate-outreach` | POST | Registered; not separately live-tested |
| `/api/explain-metric` | GET | Works |
| `/api/analysis-history` | GET | Registered; not separately live-tested |

Startup reality:

- Under system `python3` 3.14 with `/private/tmp/pulseforge-backend-deps`, startup fails due incompatible `pydantic_core`.
- Under bundled Python 3.12, imports/startup succeed.
- A backend process was already listening on `127.0.0.1:8000` during audit and responded to escalated local HTTP checks.

## 11. Problem Statement Alignment

PulseForge AI substantially fulfills the Signals Harvesting Engine problem statement:

`Signal Collection -> Evidence Validation -> Intent Analysis -> Business Twin Construction -> Opportunity Prioritization -> AI Recommendation -> Automated Business Action`

Status by stage:

| Stage | Status | Reason |
|---|---|---|
| Signal Collection | Fully satisfied | Multiple public providers and website sources. |
| Evidence Validation | Partially satisfied | Evidence objects exist, but semantic validation is too permissive. |
| Intent Analysis | Fully satisfied | Classifier and categories exist with fallback. |
| Business Twin Construction | Fully satisfied | Metrics, memory, timeline, confidence, and explainability. |
| Opportunity Prioritization | Fully satisfied | Match scoring and ranked outputs exist. |
| AI Recommendation | Partially satisfied | Recommendations cite evidence but can inherit irrelevant signals. |
| Automated Business Action | Partially satisfied | Drafts/briefs/CRM notes exist; true dispatch/export mostly simulated. |

## 12. Hackathon Scorecard

| Category | Weight | Score | Weighted Score | Reason |
|---|---:|---:|---:|---|
| Innovation & Idea Clarity | 20% | 16 / 20 | 16 | Strong, relevant business intelligence concept with clear Signals Harvesting Engine framing. Not entirely novel versus sales intelligence platforms, but well packaged. |
| Technical Implementation | 25% | 17 / 25 | 17 | React/FastAPI integration works, endpoints are registered, build passes, workflows complete under 15s. Loses points for broken local venv, lint failure, metadata files, and simulated UI actions. |
| AI & Agentic Workflow Integration | 20% | 14 / 20 | 14 | Multiple AI/agent components exist with fallback and explainability. Loses points for invalid Gemini, weak relevance filtering, and some deterministic/demo-heavy “agent” behavior. |
| UI/UX & Product Design | 15% | 12 / 15 | 12 | Enterprise-grade desktop feel and good demo workspace. Loses points for mobile uncertainty, dense layouts, and some flash-only controls. |
| Scalability & Business Potential | 10% | 8 / 10 | 8 | Strong business-development use case and public signal model. Needs CRM integrations, tenant/security model, and data quality controls. |
| Presentation & Communication | 10% | 8 / 10 | 8 | Demo narrative is strong. Must avoid weak evidence examples and clarify what is live versus simulated. |

Overall Score: **75 / 100**

Expected Hackathon Rank: **Top 20**

Top 10 capable: **Yes, if demo is controlled and backend is pre-started.**  
Top 3 capable: **Not yet.**  
Winner-level: **No, not until evidence quality and real action execution improve.**

## 13. Final Verdict

PulseForge AI is hackathon-ready for a strong presentation, but it is not yet ready to win a national-level final on technical scrutiny. The core idea is compelling and the implementation is broader than most hackathon projects. However, national judges will notice invalid AI/search integrations, noisy evidence extraction, simulated actions, and environment fragility if they probe beyond the happy path.

What prevents 100/100:

1. Invalid Gemini and Google credentials.
2. Public evidence relevance is not strict enough.
3. Local environment is not portable due Windows `.venv`.
4. Some enterprise actions are simulated with toast/flash messages.
5. Lint fails because of metadata files and unused code.

## 14. Top Improvements Needed

1. Fix provider credentials and validate key formats on startup.
2. Add semantic relevance filters before any evidence affects scoring.
3. Replace noisy website profile extraction with structured extraction fields and boilerplate removal.
4. Make Report, Export, Monitor, Compare, Email Pitch, and LinkedIn DM produce real artifacts or route to Action Hub content.
5. Remove `._*` files, add ignore rules, clean unused imports, and make lint pass.

Do not waste time adding:

| Avoid | Reason |
|---|---|
| More decorative animations | Current weakness is trust and evidence quality, not motion. |
| More dashboard panels | The app already has enough surfaces; depth beats breadth now. |
| More providers before relevance filtering | More bad evidence will make scoring worse. |
| A marketing landing page | The product-first opening is stronger for a judge demo. |
| Complex auth/multi-tenant features | Useful later, not the highest hackathon scoring lever. |

## 15. Final Demo Strategy

Five-minute demo sequence:

1. Start in Presentation Workspace and explain the problem: public signals are scattered and sales/BD teams miss timing.
2. Import a high-quality company website that produces clean evidence; avoid examples with noisy imported fields.
3. Show the pipeline stages completing under 15 seconds and point to evidence count/confidence.
4. Open the Business Twin and click a metric explainability drawer to prove scores are traceable.
5. Run Partnership Matcher using GenVax AI profile and show ranked matches with evidence-backed score breakdown.
6. Open Evidence Explorer and show URLs/snippets/timestamps.
7. Show Strategic Ecosystem graph briefly, but avoid flash-only Report/Export/Monitor buttons unless fixed.
8. Finish in Action Hub with an executive brief and outreach draft citing a public source.

Demo claim discipline:

- Say “public evidence-backed recommendations,” not “fully autonomous CRM execution,” unless real CRM/export dispatch is implemented.
- Say “Gemini/OpenAI-capable with fallback,” but do not claim Gemini is currently responding until the 401 is fixed.
- Say “evidence validation layer,” but acknowledge quality gate behavior if asked.

