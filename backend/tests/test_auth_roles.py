from app.core.config import get_settings
from app.models.enums import UserRole


def test_admin_emails_are_configured():
    settings = get_settings()
    assert "samarsinha2517@gmail.com" in settings.admin_emails
    assert "yashgupta220503@gmail.com" in settings.admin_emails
    assert UserRole.admin.value == "admin"
