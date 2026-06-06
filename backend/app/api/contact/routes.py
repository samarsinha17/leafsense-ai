import base64
import json
from email.message import EmailMessage
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field


router = APIRouter(prefix="/contact", tags=["contact"])


class GmailContactRequest(BaseModel):
    access_token: str = Field(min_length=20)
    name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=3, max_length=180)
    subject: str = Field(min_length=1, max_length=180)
    message: str = Field(min_length=1, max_length=4000)


@router.post("/send-gmail")
def send_gmail_contact(payload: GmailContactRequest):
    message = EmailMessage()
    message["To"] = "samarsinha2517@gmail.com"
    message["Cc"] = "yashgupta220503@gmail.com"
    message["Subject"] = payload.subject
    message.set_content(
        "\n".join(
            [
                "LeafSense AI contact form submission",
                "",
                f"Name: {payload.name}",
                f"Reply Email: {payload.email}",
                "",
                payload.message,
            ]
        )
    )
    encoded = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8").rstrip("=")
    request = Request(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
        data=json.dumps({"raw": encoded}).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {payload.access_token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urlopen(request, timeout=20) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore") or "Gmail send failed"
        raise HTTPException(status_code=exc.code, detail=detail) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Unable to send email through Gmail") from exc
