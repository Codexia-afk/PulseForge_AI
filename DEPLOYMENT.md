# PulseForge AI Deployment

PulseForge AI deploys as two services:

- Frontend: Vercel, serving the React + TypeScript + Vite app from `dist`.
- Backend: a separate FastAPI host such as Render, Railway, Fly.io, Azure Container Apps, or Google Cloud Run.

Vercel should host the frontend only. The FastAPI backend uses private provider secrets and must not be bundled into the browser build.

## Vercel Frontend

Use these settings in Vercel:

- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`
- Environment variable: `VITE_API_BASE_URL=https://your-backend-url`

`vercel.json` includes the SPA rewrite fallback to `index.html`, so direct navigation to client-side routes will load correctly.

If `VITE_API_BASE_URL` is not set in production, the app stays in Presentation Mode and shows a backend setup warning for Live Intelligence. It will not call `localhost` or `127.0.0.1` from the deployed frontend.

## FastAPI Backend

Deploy `backend/` separately. Render or Railway are the simplest options for this app; Google Cloud Run is a strong production choice if you want containerized scaling and cloud IAM.

Backend start command:

```sh
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Backend environment variables:

```sh
TAVILY_API_KEY=...
NEWS_API_KEY=...
GEMINI_API_KEY=...
OPENAI_API_KEY=...
GOOGLE_API_KEY=...
GOOGLE_CX=...
FRONTEND_ORIGINS=https://your-vercel-app.vercel.app
PORT=8000
DEBUG=false
```

After the backend deploys, set Vercel `VITE_API_BASE_URL` to the backend service URL and redeploy the frontend.

## Local Verification

```sh
npm install
npm run build
npm run preview
```

Optional local backend:

```sh
npm run dev:backend
VITE_API_BASE_URL=http://127.0.0.1:8000 npm run dev:frontend
```
