# PulseForge AI

## PulseForge local startup

Run the frontend and backend in separate terminals from the project root:

```sh
npm run dev:backend
npm run dev:frontend
```

The frontend checks `VITE_API_BASE_URL` first. In local development only, if it is not set, it tries common local FastAPI ports including `8000`, `8001`, `8002`, and `8011`.

To force one backend URL:

```sh
VITE_API_BASE_URL=http://127.0.0.1:8000 npm run dev:frontend
```

## Vercel deployment

PulseForge deploys as a Vite SPA on Vercel. The FastAPI backend must be deployed separately because it needs private API keys.

Vercel settings:

- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_BASE_URL=https://your-backend-url`

Do not add backend secrets to Vercel frontend environment variables. Keep `TAVILY_API_KEY`, `NEWS_API_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY`, and `GOOGLE_CX` on the backend host only.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full frontend/backend deployment split.

## Vite

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
