from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import api_router
from app.api.auth.routes import router as auth_router
from app.core.config import get_settings
from app.database.session import Base, engine
from app.training.inference import EfficientNetInferenceEngine
import app.models  # noqa: F401
from pathlib import Path

settings = get_settings()
Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
Path(settings.report_dir).mkdir(parents=True, exist_ok=True)
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name, version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router, prefix=settings.api_prefix)
app.include_router(auth_router)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")
app.mount("/reports", StaticFiles(directory=settings.report_dir), name="reports")


@app.get("/health")
def health():
    return {"status": "healthy", "service": settings.app_name}


@app.get("/")
def root():
    return {"status": "healthy", "service": settings.app_name, "docs": "/docs", "modelHealth": "/health/model"}


@app.get("/health/model")
def model_health(load: bool = False):
    return EfficientNetInferenceEngine().status(load_model=load)
