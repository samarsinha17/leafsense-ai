from pathlib import Path
from uuid import uuid4
from fastapi import UploadFile
from app.core.config import get_settings


class StorageService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.upload_dir = Path(self.settings.upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    async def save_upload(self, file: UploadFile) -> str:
        suffix = Path(file.filename or "leaf.jpg").suffix.lower() or ".jpg"
        filename = f"{uuid4().hex}{suffix}"
        path = self.upload_dir / filename
        content = await file.read()
        path.write_bytes(content)
        return f"/uploads/{filename}"
