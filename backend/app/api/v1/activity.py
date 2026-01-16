"""
Activity logs API endpoints.
Provides access to audit trail for the current user.
"""
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.schemas import ActivityLogResponse
from app.models.user import User
from app.models.activity_log import ActivityLog


router = APIRouter(prefix="/activity", tags=["Activity Logs"])


@router.get("", response_model=List[ActivityLogResponse])
async def list_activity_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    entity_type: str = Query(None, description="Filter by entity type (collection, record, user)"),
    action: str = Query(None, description="Filter by action (created, updated, deleted)"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get activity logs for the current user.
    Provides audit trail of all actions.
    """
    # Build query
    query = select(ActivityLog).where(ActivityLog.user_id == current_user.id)
    
    if entity_type:
        query = query.where(ActivityLog.entity_type == entity_type)
    
    if action:
        query = query.where(ActivityLog.action == action)
    
    query = query.offset(skip).limit(limit).order_by(ActivityLog.created_at.desc())
    
    result = await db.execute(query)
    logs = result.scalars().all()
    
    return [ActivityLogResponse.from_orm(log) for log in logs]
