from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "LeafSense AI"
    api_prefix: str = "/api/v1"
    database_url: str = "sqlite:///./leafsense_dev.db"
    jwt_secret: str = Field(default="development-only-change-me", alias="JWT_SECRET")
    jwt_refresh_secret: str = Field(default="development-only-refresh-change-me", alias="JWT_REFRESH_SECRET")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 14
    google_client_id: str | None = Field(default=None, alias="GOOGLE_CLIENT_ID")
    google_client_secret: str | None = None
    gemini_api_key: str | None = None
    openai_api_key: str | None = Field(default=None, alias="OPENAI_API_KEY")
    smtp_email: str | None = None
    smtp_password: str | None = None
    redis_url: str = "redis://localhost:6379/0"
    backend_cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173,https://leafsense-ai-plum.vercel.app"
    upload_dir: str = "backend/uploads"
    report_dir: str = "backend/reports"
    model_path: str | None = Field(default=None, alias="LEAFSENSE_MODEL_PATH")
    huggingface_model_repo: str = Field(default="samarsinha2517/leafsense-ai-model", alias="HUGGINGFACE_MODEL_REPO")
    huggingface_model_file: str = Field(default="leafsense_model.keras", alias="HUGGINGFACE_MODEL_FILE")
    huggingface_labels_file: str = Field(default="labels.json", alias="HUGGINGFACE_LABELS_FILE")
    huggingface_token: str | None = Field(default=None, alias="HUGGINGFACE_TOKEN")
    enable_model_inference: bool = Field(default=False, alias="ENABLE_MODEL_INFERENCE")
    isolate_model_inference: bool = Field(default=True, alias="ISOLATE_MODEL_INFERENCE")
    model_worker_timeout_seconds: int = Field(default=180, alias="MODEL_WORKER_TIMEOUT_SECONDS")
    admin_emails_raw: str = Field(default="samarsinha2517@gmail.com,yashgupta220503@gmail.com", alias="ADMIN_EMAILS")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore", populate_by_name=True)

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.backend_cors_origins.split(",") if origin.strip()]

    @property
    def admin_emails(self) -> tuple[str, ...]:
        return tuple(email.strip().lower() for email in self.admin_emails_raw.split(",") if email.strip())


@lru_cache
def get_settings() -> Settings:
    return Settings()
