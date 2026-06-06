# LeafSense AI

LeafSense AI is a production-oriented AI-powered plant disease detection and agricultural intelligence platform built from the attached project instruction document.

## Architecture

- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn-style UI primitives, Framer Motion, Zustand, Recharts, Axios, Lucide React, React Dropzone.
- Backend: FastAPI, SQLAlchemy, Alembic-ready models, PostgreSQL, JWT auth, role-based access, Redis/Celery-ready services, OpenCV/CV modules, Gemini recommendation layer.
- AI pipeline: dataset architecture, EfficientNet-B3 training entrypoint, dataset metadata, inference service, severity estimation, heatmap and segmentation outputs.
- Deployment: Vercel frontend configuration, Render backend blueprint, Neon PostgreSQL-compatible database URL.

## Architectural Decisions

- The provided green rounded-square LeafSense leaf logo is imported into the frontend and used across the navbar, hero, auth pages, footer, and browser favicon.
- The dataset is intentionally optional at runtime. The repository includes dataset folders, manifests, loaders, and training scripts that validate and report missing data without failing app startup.
- Cloud storage is abstracted behind a local-first storage service. This keeps uploaded images functional during local development while allowing S3-compatible storage to be configured later through environment variables.
- Gemini AI is integrated through a typed service with deterministic fallback recommendations when `GEMINI_API_KEY` is not configured. No credentials are hardcoded.

## Quick Start

1. Copy `.env.example` to `.env` and fill secrets.
2. Start backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

3. Start frontend:

```bash
cd frontend
npm install
npm run dev
```

4. Dataset preparation is available under `backend/app/training` and `dataset/`.

## Dataset Layout

```text
dataset/
  raw/
    PlantVillage/
    custom/
  processed/
    train/
    validation/
    test/
  metadata/
    labels.json
    dataset_manifest.json
```

The app and backend do not require dataset images to exist yet.

## Production Deployment

### Backend on Render

Use `deployment/render.yaml` as the Render Blueprint. Configure these environment variables in Render:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `GOOGLE_CLIENT_ID`
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `BACKEND_CORS_ORIGINS`
- `LEAFSENSE_MODEL_PATH`
- `ADMIN_EMAILS`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

`ADMIN_EMAILS` should stay limited to:

```text
samarsinha2517@gmail.com,yashgupta220503@gmail.com
```

The assistant calls OpenAI when `OPENAI_API_KEY` is valid and has quota. If OpenAI returns quota or billing errors, the backend returns the built-in context-aware agriculture fallback instead of a static placeholder.

### Frontend on Vercel

Deploy the `frontend/` folder to Vercel and set:

```text
VITE_API_URL=https://YOUR_RENDER_BACKEND_URL/api/v1
VITE_GOOGLE_CLIENT_ID=381431601099-ohmmaa7bg338hvo0bimo03h7c5geh279.apps.googleusercontent.com
```

Also add the deployed frontend domain to backend `BACKEND_CORS_ORIGINS`, for example:

```text
https://YOUR_VERCEL_DOMAIN,https://YOUR_CUSTOM_DOMAIN
```

### Google OAuth

In Google Cloud Console, add the final Vercel domain to the OAuth authorized JavaScript origins. Use the same Client ID in frontend `VITE_GOOGLE_CLIENT_ID` and backend `GOOGLE_CLIENT_ID`.

### Publish Safety

Do not commit local `.env`, SQLite databases, generated uploads, generated reports, logs, `frontend/dist`, or `frontend/node_modules`. These are ignored by `.gitignore`.
