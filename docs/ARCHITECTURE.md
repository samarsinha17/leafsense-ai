# LeafSense AI Architecture

The project follows the instruction document as the source of truth.

## Frontend

React + TypeScript + Vite implements the required pages: Home, Login, Signup, Detect Disease, Results, Dashboard, Analytics, Dataset, Research, Team, Contact, Admin Dashboard, and Profile.

## Backend

FastAPI exposes `/api/v1` routes for auth, users, disease prediction, analytics, reports, chatbot, admin, and dataset.

## Data

PostgreSQL is the production target. SQLite is the local default so tests and development can run before secrets and cloud infrastructure exist.

## AI and CV

The CV package includes preprocessing, segmentation, and localization modules. Training is EfficientNet-B3-oriented and intentionally dataset-optional until image files are available.

## Secrets

All secrets are read from environment variables. `.env.example` documents every required variable.
