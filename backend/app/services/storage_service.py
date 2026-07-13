from base64 import b64encode
from pathlib import Path
from uuid import uuid4
from fastapi import UploadFile
from app.core.config import get_settings
from dataclasses import dataclass


@dataclass(slots=True)
class StoredUpload:
    path: Path
    url: str
    data_url: str


PLACEHOLDER_SVG = """
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
  <rect width="320" height="320" rx="24" fill="#101010"/>
  <rect x="24" y="24" width="272" height="272" rx="20" fill="#182118" stroke="#2b6f45" stroke-width="4"/>
  <path d="M160 70c-46 0-84 38-84 84 0 49 41 94 84 96 43-2 84-47 84-96 0-46-38-84-84-84z" fill="#2ecc71" fill-opacity=".18" stroke="#2ecc71" stroke-width="6"/>
  <path d="M160 86v148" stroke="#aef0c1" stroke-width="8" stroke-linecap="round"/>
  <path d="M160 138c-24-6-43-20-56-40" stroke="#aef0c1" stroke-width="7" stroke-linecap="round" fill="none"/>
  <path d="M160 166c24-6 43-20 56-40" stroke="#aef0c1" stroke-width="7" stroke-linecap="round" fill="none"/>
  <text x="160" y="250" fill="#cdeed7" font-family="Arial, sans-serif" font-size="22" text-anchor="middle">Image unavailable</text>
</svg>
""".strip()


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

    def resolve_image_url(self, image_url: str) -> str:
        if not image_url:
            return image_url
        if image_url.startswith("data:") or image_url.startswith("http://") or image_url.startswith("https://"):
            return image_url
        if image_url.startswith("/uploads/"):
            path = self.upload_dir / image_url.rsplit("/", 1)[-1]
            if path.exists():
                content = path.read_bytes()
                suffix = path.suffix.lower()
                mime_type = "image/png" if suffix == ".png" else "image/jpeg"
                return f"data:{mime_type};base64,{b64encode(content).decode('ascii')}"
            placeholder = PLACEHOLDER_SVG.encode("utf-8")
            return f"data:image/svg+xml;base64,{b64encode(placeholder).decode('ascii')}"
        return image_url
