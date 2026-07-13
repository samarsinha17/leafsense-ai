from pathlib import Path
from base64 import b64encode
from uuid import uuid4
from fastapi import UploadFile
from app.core.config import get_settings
from dataclasses import dataclass


@dataclass(slots=True)
class StoredUpload:
    path: Path
    url: str
    data_url: str


class StorageService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.upload_dir = Path(self.settings.upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    async def save_upload(self, file: UploadFile) -> StoredUpload:
        suffix = Path(file.filename or "leaf.jpg").suffix.lower() or ".jpg"
        filename = f"{uuid4().hex}{suffix}"
        path = self.upload_dir / filename
        content = await file.read()
        path.write_bytes(content)
        mime_type = file.content_type or ("image/png" if suffix == ".png" else "image/jpeg")
        data_url = f"data:{mime_type};base64,{b64encode(content).decode('ascii')}"
        return StoredUpload(path=path, url=f"/uploads/{filename}", data_url=data_url)
