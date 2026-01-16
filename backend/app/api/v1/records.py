"""
Records API endpoints.
Handles CRUD operations for records within collections with ownership enforcement.
"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.schemas import (
    RecordCreate,
    RecordUpdate,
    RecordResponse,
    MessageResponse
)
from app.models.user import User
from app.models.collection import Collection
from app.models.record import Record
from app.models.activity_log import ActivityLog


router = APIRouter(prefix="/collections/{collection_id}/records", tags=["Records"])


async def verify_collection_ownership(
    collection_id: str,
    current_user: User,
    db: AsyncSession
) -> Collection:
    """
    Verify that the collection exists and belongs to the current user.
    """
    result = await db.execute(
        select(Collection).where(
            and_(
                Collection.id == collection_id,
                Collection.user_id == current_user.id,
                Collection.is_deleted == False
            )
        )
    )
    collection = result.scalar_one_or_none()
    
    if not collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found or access denied"
        )
    
    return collection


@router.post("", response_model=RecordResponse, status_code=status.HTTP_201_CREATED)
async def create_record(
    collection_id: str,
    record_data: RecordCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new record in a collection.
    """
    # Verify collection ownership
    collection = await verify_collection_ownership(collection_id, current_user, db)
    
    # TODO: Validate data against collection schema if defined
    
    # Create record - database will set timestamps
    record = Record(
        collection_id=collection.id,
        data=record_data.data
        # NO created_at or updated_at - database handles it
    )
    
    db.add(record)
    await db.commit()
    await db.refresh(record)
    
    # Log activity
    activity = ActivityLog(
        user_id=current_user.id,
        action="created",
        entity_type="record",
        entity_id=record.id,
        changes={"collection_id": collection_id}
    )
    db.add(activity)
    await db.commit()
    
    return RecordResponse.from_orm(record)


@router.get("", response_model=List[RecordResponse])
async def list_records(
    collection_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    include_deleted: bool = Query(False),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all records in a collection.
    """
    # Verify collection ownership
    await verify_collection_ownership(collection_id, current_user, db)
    
    # Build query
    query = select(Record).where(Record.collection_id == collection_id)
    
    if not include_deleted:
        query = query.where(Record.is_deleted == False)
    
    query = query.offset(skip).limit(limit).order_by(Record.created_at.desc())
    
    result = await db.execute(query)
    records = result.scalars().all()
    
    return [RecordResponse.from_orm(record) for record in records]


@router.get("/{record_id}", response_model=RecordResponse)
async def get_record(
    collection_id: str,
    record_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific record by ID.
    """
    # Verify collection ownership
    await verify_collection_ownership(collection_id, current_user, db)
    
    # Get record
    result = await db.execute(
        select(Record).where(
            and_(
                Record.id == record_id,
                Record.collection_id == collection_id
            )
        )
    )
    record = result.scalar_one_or_none()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Record not found"
        )
    
    return RecordResponse.from_orm(record)


@router.put("/{record_id}", response_model=RecordResponse)
async def update_record(
    collection_id: str,
    record_id: str,
    record_data: RecordUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a record.
    """
    # Verify collection ownership
    await verify_collection_ownership(collection_id, current_user, db)
    
    # Get record
    result = await db.execute(
        select(Record).where(
            and_(
                Record.id == record_id,
                Record.collection_id == collection_id
            )
        )
    )
    record = result.scalar_one_or_none()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Record not found"
        )
    
    # Track changes
    old_data = record.data.copy()
    
    # Update data with explicit timestamp
    record.data = record_data.data
    record.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(record)
    
    # Log activity
    activity = ActivityLog(
        user_id=current_user.id,
        action="updated",
        entity_type="record",
        entity_id=record.id,
        changes={"old": old_data, "new": record.data}
    )
    db.add(activity)
    await db.commit()
    
    return RecordResponse.from_orm(record)


@router.delete("/{record_id}", response_model=MessageResponse)
async def delete_record(
    collection_id: str,
    record_id: str,
    hard_delete: bool = Query(False, description="Permanently delete instead of soft delete"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a record (soft delete by default).
    """
    # Verify collection ownership
    await verify_collection_ownership(collection_id, current_user, db)
    
    # Get record
    result = await db.execute(
        select(Record).where(
            and_(
                Record.id == record_id,
                Record.collection_id == collection_id
            )
        )
    )
    record = result.scalar_one_or_none()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Record not found"
        )
    
    if hard_delete:
        # Permanently delete
        await db.delete(record)
        message = "Record permanently deleted"
    else:
        # Soft delete
        record.is_deleted = True
        record.deleted_at = datetime.utcnow()
        message = "Record deleted"
    
    await db.commit()
    
    # Log activity
    activity = ActivityLog(
        user_id=current_user.id,
        action="deleted",
        entity_type="record",
        entity_id=record.id,
        changes={"hard_delete": hard_delete, "data": record.data}
    )
    db.add(activity)
    await db.commit()
    
    return MessageResponse(message=message)
