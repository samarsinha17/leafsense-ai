# LeafSense AI

LeafSense AI is an AI-powered plant disease detection and agricultural intelligence platform designed to help farmers, researchers, and agricultural professionals identify plant diseases through leaf image analysis and receive actionable recommendations.

---

## Features

* AI-powered plant disease detection
* Disease severity estimation
* Image preprocessing and segmentation
* Heatmap visualization for affected regions
* AI-assisted agricultural recommendations
* Persisted Detect Disease workflow that restores completed scans after navigation
* Sitewide language selector with English, Hindi, and Hinglish support
* User authentication with Google OAuth
* Role-based access control
* Analytics dashboard
* Report generation and export
* Dataset management and research tools

---

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Zustand
* Recharts
* Axios
* Lucide React
* React Dropzone

### Backend

* FastAPI
* SQLAlchemy
* PostgreSQL
* Alembic
* JWT Authentication
* Role-Based Access Control
* OpenCV
* Gemini AI Integration

### AI & Computer Vision

* EfficientNet-B3
* OpenCV Image Processing
* Disease Severity Analysis
* Segmentation Pipeline
* Heatmap Generation
* Dataset Metadata Management

---

## Project Structure

```text
LeafSense-AI/
|-- frontend/
|-- backend/
|-- dataset/
|-- deployment/
|-- docs/
|-- hf_space/
`-- tools/
```

---

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/samarsinha17/leafsense-ai.git
cd leafsense-ai
```

### 2. Configure Environment Variables

Copy the example files and update values:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

---

## Backend Setup

```bash
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend will run on:

```text
http://localhost:8000
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend will run on:

```text
http://localhost:5173
```

---

## Dataset Layout

```text
dataset/
├── raw/
│   ├── PlantVillage/
│   └── custom/
├── processed/
│   ├── train/
│   ├── validation/
│   └── test/
└── metadata/
    ├── labels.json
    └── dataset_manifest.json
```

The application can run without the dataset being present. Dataset files are only required for training and evaluation workflows.

---

## Environment Variables

### Backend

```text
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
GOOGLE_CLIENT_ID=
OPENAI_API_KEY=
GEMINI_API_KEY=
BACKEND_CORS_ORIGINS=
LEAFSENSE_MODEL_PATH=
ADMIN_EMAILS=
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

### Frontend

```text
VITE_API_URL=
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```

### Hugging Face Space

```text
HF_TOKEN=
HUGGINGFACE_MODEL_REPO=samarsinha2517/leafsense-ai-model
HUGGINGFACE_MODEL_FILE=leafsense_model.keras
HUGGINGFACE_LABELS_FILE=labels.json
HUGGINGFACE_SPACE_URL=https://samarsinha2517-leafsense-ai-model.hf.space
HUGGINGFACE_SPACE_ENDPOINT=/predict
```

---

## Production Deployment

### Backend (Render)

Deploy the backend using the Render configuration located in:

```text
deployment/render.yaml
```

Configure all required environment variables through the Render dashboard.

---

### Database (PostgreSQL)

Compatible with:

* Neon PostgreSQL
* Supabase PostgreSQL
* Managed PostgreSQL providers

---

### Frontend (Vercel)

Deploy the `frontend/` directory to Vercel.

Required environment variables:

```text
VITE_API_URL=https://YOUR_BACKEND_URL/api/v1
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```

---

## Google OAuth Setup

1. Create OAuth credentials in Google Cloud Console.
2. Add your local and production domains to Authorized JavaScript Origins.
3. Use the same Client ID in both frontend and backend configuration.
4. Configure OAuth consent screen before production release.

---

## AI Recommendation Engine

LeafSense AI supports integration with external AI providers through environment variables.

When AI provider credentials are unavailable, the platform gracefully falls back to built-in recommendation logic to maintain core functionality.

## Detect Disease Workflow

The Detect Disease page now restores the completed scan after navigation.

* Upload a leaf image
* Click Analyze Plant
* View the result immediately
* Switch to another page and come back without losing the scan
* Use New Scan only when you want to start over

---

## Language Support

The frontend includes a sitewide language selector so the interface can switch between:

* English
* Hindi
* Hinglish

Brand name, logo, and other project identity elements remain unchanged.

---

## Security Notes

Never commit:

```text
.env
backend/.env
frontend/.env

node_modules/
frontend/dist/

uploads/
generated_reports/

*.db
*.sqlite
*.sqlite3

logs/
```

These files are excluded through `.gitignore`.

---

## Contributors

### Project Team

* Samar Sinha — Full Stack Development, AI Integration, System Design
* Yash Gupta — Data Analysis, Research, Documentation

### Academic Project

LeafSense AI is being developed as a final-year B.Tech Computer Science Engineering project.

---

## License

This project is intended for educational, research, and demonstration purposes.

---

## Disclaimer

LeafSense AI provides AI-assisted disease detection and recommendations. Results should be validated by agricultural experts before making critical farming decisions.
