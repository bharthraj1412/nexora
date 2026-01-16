"""
Collections API endpoints.
Handles CRUD operations for user collections with ownership enforcement.
"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.schemas import (
    CollectionCreate,
    CollectionUpdate,
    CollectionResponse,
    MessageResponse
)
from app.models.user import User
from app.models.collection import Collection
from app.models.record import Record
from app.models.activity_log import ActivityLog


router = APIRouter(prefix="/collections", tags=["Collections"])


@router.post("", response_model=CollectionResponse, status_code=status.HTTP_201_CREATED)
async def create_collection(
    collection_data: CollectionCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new collection.
    """
    # Create collection - database will set timestamps
    collection = Collection(
        user_id=current_user.id,
        name=collection_data.name,
        description=collection_data.description,
        schema=collection_data.schema or {}
        # NO created_at or updated_at - database handles it
    )
    
    db.add(collection)
    await db.commit()
    await db.refresh(collection)
    
    # Log activity
    activity = ActivityLog(
        user_id=current_user.id,
        action="created",
        entity_type="collection",
        entity_id=collection.id,
        changes={"name": collection.name}
    )
    db.add(activity)
    await db.commit()
    
    # Add record count
    response = CollectionResponse.from_orm(collection)
    response.record_count = 0
    
    return response


@router.get("", response_model=List[CollectionResponse])
async def list_collections(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    include_deleted: bool = Query(False),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all collections for the current user.
    """
    # Build query with ownership filter
    query = select(Collection).where(Collection.user_id == current_user.id)
    
    if not include_deleted:
        query = query.where(Collection.is_deleted == False)
    
    query = query.offset(skip).limit(limit).order_by(Collection.created_at.desc())
    
    result = await db.execute(query)
    collections = result.scalars().all()
    
    # Add record counts
    response_list = []
    for collection in collections:
        # Count records
        count_query = select(func.count(Record.id)).where(
            and_(
                Record.collection_id == collection.id,
                Record.is_deleted == False
            )
        )
        count_result = await db.execute(count_query)
        record_count = count_result.scalar()
        
        col_response = CollectionResponse.from_orm(collection)
        col_response.record_count = record_count
        response_list.append(col_response)
    
    return response_list


@router.get("/{collection_id}", response_model=CollectionResponse)
async def get_collection(
    collection_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific collection by ID.
    Enforces ownership - users can only access their own collections.
    """
    result = await db.execute(
        select(Collection).where(
            and_(
                Collection.id == collection_id,
                Collection.user_id == current_user.id
            )
        )
    )
    collection = result.scalar_one_or_none()
    
    if not collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found"
        )
    
    # Count records
    count_query = select(func.count(Record.id)).where(
        and_(
            Record.collection_id == collection.id,
            Record.is_deleted == False
        )
    )
    count_result = await db.execute(count_query)
    record_count = count_result.scalar()
    
    response = CollectionResponse.from_orm(collection)
    response.record_count = record_count
    
    return response


@router.put("/{collection_id}", response_model=CollectionResponse)
async def update_collection(
    collection_id: str,
    collection_data: CollectionUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a collection.
    Enforces ownership - users can only update their own collections.
    """
    result = await db.execute(
        select(Collection).where(
            and_(
                Collection.id == collection_id,
                Collection.user_id == current_user.id
            )
        )
    )
    collection = result.scalar_one_or_none()
    
    if not collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found"
        )
    
    # Track changes for audit log
    changes = {}
    
    # Update fields
    if collection_data.name is not None:
        changes["name"] = {"old": collection.name, "new": collection_data.name}
        collection.name = collection_data.name
    
    if collection_data.description is not None:
        changes["description"] = {"old": collection.description, "new": collection_data.description}
        collection.description = collection_data.description
    
    if collection_data.schema is not None:
        changes["schema"] = {"old": collection.schema, "new": collection_data.schema}
        collection.schema = collection_data.schema
    
    # Explicitly update timestamp
    collection.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(collection)
    
    # Log activity
    if changes:
        activity = ActivityLog(
            user_id=current_user.id,
            action="updated",
            entity_type="collection",
            entity_id=collection.id,
            changes=changes
        )
        db.add(activity)
        await db.commit()
    
    # Count records
    count_query = select(func.count(Record.id)).where(
        and_(
            Record.collection_id == collection.id,
            Record.is_deleted == False
        )
    )
    count_result = await db.execute(count_query)
    record_count = count_result.scalar()
    
    response = CollectionResponse.from_orm(collection)
    response.record_count = record_count
    
    return response


@router.delete("/{collection_id}", response_model=MessageResponse)
async def delete_collection(
    collection_id: str,
    hard_delete: bool = Query(False, description="Permanently delete instead of soft delete"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a collection (soft delete by default).
    Enforces ownership - users can only delete their own collections.
    """
    result = await db.execute(
        select(Collection).where(
            and_(
                Collection.id == collection_id,
                Collection.user_id == current_user.id
            )
        )
    )
    collection = result.scalar_one_or_none()
    
    if not collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found"
        )
    
    if hard_delete:
        # Permanently delete
        await db.delete(collection)
        message = "Collection permanently deleted"
    else:
        # Soft delete
        collection.is_deleted = True
        collection.deleted_at = datetime.utcnow()
        message = "Collection deleted"
    
    await db.commit()
    
    # Log activity
    activity = ActivityLog(
        user_id=current_user.id,
        action="deleted",
        entity_type="collection",
        entity_id=collection.id,
        changes={"hard_delete": hard_delete}
    )
    db.add(activity)
    await db.commit()
    
    return MessageResponse(message=message)
