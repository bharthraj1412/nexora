"""API v1 router initialization."""
from fastapi import APIRouter
from app.api.v1 import auth, collections, records, activity, file_import

router = APIRouter(prefix="/v1")

router.include_router(auth.router)
router.include_router(collections.router)
router.include_router(records.router)
router.include_router(activity.router)
router.include_router(file_import.router)
