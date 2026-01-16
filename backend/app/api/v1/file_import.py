"""
File import API endpoints.
Handles file upload, preview, and batch import of collections and records.
"""
import json
from typing import Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.models.collection import Collection
from app.models.record import Record
from app.models.activity_log import ActivityLog
from app.services.file_import import process_import_file


router = APIRouter(prefix="/import", tags=["Import"])


class ImportPreviewResponse(BaseModel):
    """Response for file preview."""
    folder_name: str
    total_rows: int
    total_columns: int
    schema: Dict[str, Any]
    preview: list[Dict[str, Any]]


class ImportConfirmRequest(BaseModel):
    """Request to confirm and execute import."""
    folder_name: str
    description: str = ""
    schema: Dict[str, Any]
    records: list[Dict[str, Any]]


class ImportResultResponse(BaseModel):
    """Response after successful import."""
    collection_id: str
    folder_name: str
    items_created: int
    message: str


@router.post("/preview", response_model=ImportPreviewResponse)
async def preview_file_import(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload and preview a CSV/Excel file.
    Returns schema and first 5 rows ONLY. Does not return full dataset.
    """
    # Process file to get preview and stats only
    import_data = await process_import_file(file, preview_only=True)
    
    return ImportPreviewResponse(
        folder_name=import_data['folder_name'],
        total_rows=import_data['total_rows'],
        total_columns=import_data['total_columns'],
        schema=import_data['schema'],
        preview=import_data['preview']
    )



@router.post("/upload", response_model=ImportResultResponse)
async def upload_and_import_file(
    folder_name: str = Form(...),
    description: str = Form(""),
    schema: str = Form(None),  # Optional: renamed schema from frontend
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Stream and import a CSV/Excel file directly into the database.
    - Atomic Transaction: Folder + Items created together.
    - Streaming/Batching: Reads file in chunks (via pandas chunksize if possible, or parsing full df then batch inserting).
    - Database-generated UTC Timestamps.
    - Accepts renamed field names from frontend.
    """
    BATCH_SIZE = 1000
    
    try:
        # 1. Parse file
        import_data = await process_import_file(file, preview_only=False)
        records = import_data['records']
        detected_schema = import_data['schema']
        
        # 2. Use renamed schema if provided, otherwise use detected schema
        if schema:
            try:
                final_schema = json.loads(schema)
                # Validate renamed schema
                validate_schema_fields(final_schema)
            except json.JSONDecodeError:
                raise HTTPException(400, "Invalid schema format")
        else:
            final_schema = detected_schema
        
        # 3. Start Transaction
        # Create collection - database will set created_at and updated_at
        collection = Collection(
            user_id=current_user.id,
            name=folder_name,
            description=description,
            schema=final_schema  # Use renamed or detected schema
            # NO created_at or updated_at - database handles it
        )
        
        db.add(collection)
        await db.flush()

        # 4. Batch Insert Items
        items_created = 0
        records_to_add = []
        
        for record_data in records:
            record = Record(
                collection_id=collection.id,
                data=record_data
                # NO created_at or updated_at - database handles it
            )
            records_to_add.append(record)
            
            if len(records_to_add) >= BATCH_SIZE:
                db.add_all(records_to_add)
                await db.flush()
                items_created += len(records_to_add)
                records_to_add = []
        
        if records_to_add:
            db.add_all(records_to_add)
            items_created += len(records_to_add)

        # 5. Log Activity - database will set created_at
        activity = ActivityLog(
            user_id=current_user.id,
            action="created",
            entity_type="collection",
            entity_id=collection.id,
            changes={
                "source": "file_import",
                "items_imported": items_created,
                "folder_name": collection.name
            }
            # NO created_at - database handles it
        )
        db.add(activity)

        # 6. Commit
        await db.commit()
        await db.refresh(collection)
        
        return ImportResultResponse(
            collection_id=collection.id,
            folder_name=collection.name,
            items_created=items_created,
            message=f"Successfully imported {items_created} items into '{collection.name}'"
        )

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Import failed: {str(e)}"
        )


def validate_schema_fields(schema: dict) -> None:
    """
    Validate field names in schema.
    Ensures no empty names and no duplicates.
    """
    fields = schema.get('fields', [])
    
    if not fields:
        raise HTTPException(400, "Schema must have at least one field")
    
    labels = [f['label'].strip() for f in fields]
    
    # Check for empty names
    if any(not label for label in labels):
        raise HTTPException(400, "Field names cannot be empty")
    
    # Check for duplicates (case-insensitive)
    lowercase_labels = [l.lower() for l in labels]
    if len(lowercase_labels) != len(set(lowercase_labels)):
        raise HTTPException(400, "Field names must be unique")

