from fastapi import APIRouter
from app.api.admin.routes import router as admin_router
from app.api.analytics.routes import router as analytics_router
from app.api.auth.routes import router as auth_router
from app.api.chatbot.routes import router as chatbot_router
from app.api.contact.routes import router as contact_router
from app.api.dataset.routes import router as dataset_router
from app.api.disease.routes import router as disease_router
from app.api.reports.routes import router as reports_router
from app.api.users.routes import router as users_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(disease_router)
api_router.include_router(analytics_router)
api_router.include_router(reports_router)
api_router.include_router(chatbot_router)
api_router.include_router(contact_router)
api_router.include_router(admin_router)
api_router.include_router(dataset_router)
