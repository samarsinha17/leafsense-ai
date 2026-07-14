# LeafSense AI

LeafSense AI is a full-stack plant disease detection and agricultural intelligence platform that turns a single leaf image into a structured diagnosis, explainability output, severity estimate, and follow-up guidance.

It combines a React frontend, a FastAPI backend, an EfficientNet-B3 inference pipeline, PostgreSQL-ready persistence, multilingual UX, analytics, report generation, and an admin workflow into one cohesive product.

## Project Snapshot

- Upload a plant image and analyze it in seconds
- View disease class, confidence, crop type, severity, and infected-area estimate
- Inspect heatmap and highlighted visual output for explainability
- Save, reopen, and export diagnosis history and reports
- Use the app in English, Hindi, or Hinglish
- Review analytics, dataset intelligence, model details, and research sections
- Manage user, report, dataset, and system workflows from the admin console

---

## Table of Contents
- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture Explanation](#architecture-explanation)
- [Architecture Diagram](#architecture-diagram)
- [Repository Structure](#repository-structure)
- [Installation and Local Setup](#installation-and-local-setup)
- [Environment Configuration](#environment-configuration)
- [AI and Model Details](#ai-and-model-details)
- [Research Publication](#research-publication)
- [Demo / Screenshots](#demo--screenshots)
- [Production Deployment](#production-deployment)
- [Security Notes](#security-notes)
- [License](#license)
- [Disclaimer](#disclaimer)

---

## Project Overview
LeafSense AI is designed for practical plant disease screening from leaf images. A user can upload a photo, receive a predicted crop and disease class, inspect confidence and severity, compare visual explainability output, and review agronomy-focused next steps.

The repository is intentionally more than a UI mockup. It contains the frontend routes, backend APIs, report workflow, analytics views, dataset metadata, model documentation, and admin screens needed for a real product-style demonstration.

## Problem Statement
Manual leaf inspection is slow, inconsistent, and hard to scale. Farmers, students, and agriculture teams need a browser-based workflow that can turn one leaf photo into a useful diagnosis while still explaining the result clearly enough to support decision-making.

## Solution
LeafSense AI solves that workflow with:

1. A modern React interface for upload, language switching, result review, and navigation.
2. A FastAPI backend for authentication, prediction requests, report generation, analytics, and admin data.
3. An EfficientNet-B3-based disease classification pipeline.
4. Heatmap and highlighted image outputs for explainability.
5. Persistent scan state so the Detect Disease experience survives route navigation.
6. A report and analytics layer for later review and sharing.

---

## Features
- AI-based plant disease detection from leaf images
- Upload, browse, drag-and-drop, and camera capture support
- Auto-detect crop hint workflow
- Disease prediction with confidence score output
- Disease severity presentation on the result screen
- Explainability outputs using heatmap and highlighted images
- Crop information, fact cards, and recommendation text
- Prediction history via My Diagnoses and My Reports
- Authentication system with login, signup, profile, and Google OAuth UI
- Analytics dashboard with crop and scan insights
- Admin console for users, reports, dataset, and system monitoring
- Assistant history and report-aware plant assistant workflow
- Language support for English, Hindi, and Hinglish
- PDF, CSV, email, and share actions from the diagnosis result
- Detect Disease workflow persistence across route navigation

---

## Technology Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Shared reusable UI components
- Zustand
- React Router
- Recharts
- Axios
- React Dropzone
- Lucide React
- Framer Motion

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL-compatible persistence
- Alembic
- JWT authentication
- OpenCV
- Pydantic / Pydantic Settings
- ReportLab
- Redis and Celery support

### AI / ML
- TensorFlow
- EfficientNet-B3
- Pillow
- OpenCV image preprocessing
- PlantVillage-style class metadata
- Heatmap-based explainability output

### Deployment
- Vercel for the frontend
- Render for the backend
- Hugging Face Space for isolated model inference when enabled
- Neon-compatible PostgreSQL deployments

---

## Architecture Explanation
The application follows a standard full-stack AI product flow:

User -> React + TypeScript Frontend -> FastAPI Backend -> JWT Authentication Layer -> Prediction Service -> EfficientNet-B3 Inference Model -> Disease Classification Output -> Heatmap / Highlight Layer -> PostgreSQL Storage + Report / History Layer

The frontend handles upload, navigation, language switching, and result presentation. The backend manages authenticated APIs, persistence, report generation, and model orchestration. The model pipeline returns the disease prediction, confidence, explainability images, and recommendation metadata.

---

## Architecture Diagram
```mermaid
flowchart TD
    A[User] --> B[React + TypeScript Frontend]
    B --> C[FastAPI Backend]
    C --> D[JWT Authentication Layer]
    C --> E[Prediction Service]
    E --> F[EfficientNet-B3 Inference Model]
    F --> G[Plant Disease Prediction]
    E --> H[Heatmap Explainability Layer]
    H --> I[Heatmap and Highlighted Output]
    C --> J[(PostgreSQL Database)]
    C --> K[Report and History Services]
    C --> L[Assistant and Admin APIs]
```

---

## Repository Structure
```text
LeafSense AI/
|-- frontend/
|-- backend/
|-- dataset/
|-- deployment/
|-- docs/
|-- hf_space/
|-- screenshots/
|-- LICENSE
`-- README.md
```

---

## Installation and Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/samarsinha17/leafsense-ai.git
cd leafsense-ai
```

### 2. Create environment files
Copy the example files and update the values locally:
```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Backend setup
```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

Windows PowerShell:
```powershell
.\.venv\Scripts\Activate.ps1
```

Windows Command Prompt:
```bat
.\.venv\Scripts\activate.bat
```

Install dependencies and start the API:
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend defaults to:
```text
http://localhost:8000
```

### 4. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

Frontend defaults to:
```text
http://localhost:5173
```

The application can run locally without the final dataset files present. Dataset metadata and the inference pipeline are already scaffolded in the repository.

---

## Environment Configuration
Use placeholders only. Never commit secrets.

### Backend
```env
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
OPENAI_API_KEY=
GEMINI_API_KEY=
SMTP_EMAIL=
SMTP_PASSWORD=
REDIS_URL=
BACKEND_CORS_ORIGINS=
LEAFSENSE_MODEL_PATH=
HUGGINGFACE_TOKEN=
HUGGINGFACE_MODEL_REPO=
HUGGINGFACE_MODEL_FILE=
HUGGINGFACE_LABELS_FILE=
HUGGINGFACE_SPACE_URL=
HUGGINGFACE_SPACE_ENDPOINT=
ENABLE_MODEL_INFERENCE=
ISOLATE_MODEL_INFERENCE=
MODEL_WORKER_TIMEOUT_SECONDS=
ADMIN_EMAILS=
```

### Frontend
```env
VITE_API_URL=
VITE_GOOGLE_CLIENT_ID=
```

### Hugging Face Space
If you use the isolated model path, keep the Hugging Face settings in the backend environment and point them to the deployed Space endpoint.

---

## AI and Model Details
- Dataset source metadata: PlantVillage-style sources plus custom entries
- Supported crop groups: Tomato, Potato, Corn, Apple, Grape, Pepper
- Label set size: 39 classes, including an unknown / low-confidence class in the dataset manifest
- Model family: EfficientNet-B3
- Input size: 300 x 300 RGB
- Role in the app: inference only in the current production workflow
- Explainability: the result view returns heatmap and highlighted image outputs so the user can compare the model output with visible symptoms
- Training approach: the repository includes an EfficientNet-B3 transfer-learning scaffold with dataset split documentation and validation-oriented model metadata

The current public-facing explainability view uses heatmap and highlighted overlays rather than a literal Grad-CAM package, which matches the implementation in the repository.

The repository includes the model-oriented training scaffold, dataset metadata, and inference pipeline so the project is documented as a real AI/ML system rather than a static demo.

---

## Research Publication
**AI-Driven Detection of Plant Diseases through Leaf Image Analysis**

This repository is based on the published research paper behind the LeafSense AI project.

### Abstract
Plant disease detection remains a critical challenge for food security because late identification can significantly reduce crop yield and quality. Manual inspection by specialists is often time-consuming, inconsistent, and difficult to scale across crop types and changing field conditions. This project addresses that gap with an AI-assisted leaf analysis system that classifies plant diseases from images, supports multiple crop groups, and improves diagnostic consistency through a structured digital workflow. The paper also reviews image-based disease detection methods and their contribution to agricultural intelligence.

### Publication Details
- Published in: [2025 Modern Electronics Devices and Intelligent Communication Systems (MEDCOM)](https://ieeexplore.ieee.org/xpl/conhome/11404730/proceeding)
- Paper link: [IEEE Xplore - Document 11405332](https://ieeexplore.ieee.org/document/11405332)
- Date of Conference: 11-13 December 2025
- Date Added to IEEE Xplore: 02 March 2026
- Electronic ISBN: 979-8-3315-7444-4
- Print on Demand (PoD) ISBN: 979-8-3315-7445-1
- Venue: [GL Bajaj Institute of Technology and Management](https://www.glbitm.org/), Greater Noida

The research-facing pages and documentation present the project scope, methodology, model architecture, dataset summary, and future scope in a recruiter-friendly form.

---

## Demo / Screenshots
All screenshots below are real application captures from the current repository and are organized in the `screenshots/` folder. Pages such as the dashboard, profile, dataset, and admin console intentionally show seeded/demo data from the app, while the Detect Disease result screenshot reflects the actual inference workflow.

### Landing and Access
- Home landing page

  ![Home landing page](screenshots/home_landing_public.png)

- Home landing page with hero and stats

  ![Home landing page with hero and stats](screenshots/home_landing_public_alt.png)

- Home feature section and how-it-works area

  ![Home feature section](screenshots/home_features.png)

- Login page

  ![Login page](screenshots/login_page.png)

### Detection Workflow
- Detect Disease upload screen

  ![Detect Disease upload screen](screenshots/detect_upload.png)

- Detect Disease upload screen in Hindi

  ![Detect Disease upload screen in Hindi](screenshots/detect_hindi_upload.png)

- Detect Disease upload screen in Hinglish

  ![Detect Disease upload screen in Hinglish](screenshots/detect_hinglish_upload.png)

- Detection result page

  ![Detection result page](screenshots/detect_result.png)

### Product Pages
- User dashboard

  ![User dashboard](screenshots/dashboard.png)

- Analytics dashboard

  ![Analytics dashboard](screenshots/analytics.png)

- Dataset page

  ![Dataset page](screenshots/dataset.png)

- Model details page

  ![Model details page](screenshots/model.png)

### User Workspace
- Plant Assistant AI

  ![Plant Assistant AI](screenshots/assistant.png)

- Assistant history

  ![Assistant history](screenshots/assistant_history.png)

- My diagnoses

  ![My diagnoses](screenshots/my_diagnoses.png)

- My reports

  ![My reports](screenshots/my_reports.png)

- My analytics

  ![My analytics](screenshots/my_analytics.png)

- Profile page

  ![Profile page](screenshots/profile.png)

- Settings page

  ![Settings page](screenshots/settings.png)

### Research and Administration
- Research overview

  ![Research overview](screenshots/research_intro.png)

- Research details

  ![Research details](screenshots/research_details.png)

- Contact page

  ![Contact page](screenshots/contact.png)

- Admin dashboard overview

  ![Admin dashboard overview](screenshots/admin_overview.png)

- Admin menu and nested navigation

  ![Admin menu and nested navigation](screenshots/admin_menu.png)

---

## Production Deployment

### Backend on Render
Use the Render configuration in:
```text
deployment/render.yaml
```

Set all required backend environment variables in the Render dashboard.

### Frontend on Vercel
Deploy the `frontend/` directory to Vercel and configure:
```env
VITE_API_URL=https://YOUR_BACKEND_URL/api/v1
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```

### Database
Compatible PostgreSQL targets include:
- Neon PostgreSQL
- Supabase PostgreSQL
- Other managed PostgreSQL providers

### Model Serving
The backend can be configured to use isolated model inference and a Hugging Face Space endpoint when that deployment path is enabled.

---

## Security Notes
Never commit:
```text
.env
backend/.env
frontend/.env
frontend/.env.local
node_modules/
frontend/dist/
backend/uploads/
backend/reports/
*.db
*.sqlite
*.sqlite3
logs/
```

The repository already ignores environment files and generated artifacts through `.gitignore`.

---

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for full terms.

---

## Disclaimer
LeafSense AI provides AI-assisted disease detection and recommendations. Results should be validated by agricultural experts before making critical farming decisions.
