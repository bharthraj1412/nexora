"""
Collection model for user-defined data structures.
"""
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON, text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Collection(Base):
    """User-defined data collection."""
    
    __tablename__ = "collections"
    
    # Primary key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # User relationship
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Collection details
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    
    # Schema definition (field types, validations, etc.)
    schema = Column(JSON, nullable=True, default=dict)
    
    # Soft delete
    is_deleted = Column(Boolean, default=False, nullable=False)
    
    # Timestamps - Database-generated UTC
    created_at = Column(
        DateTime,
        server_default=text("(datetime('now'))"),
        nullable=False
    )
    updated_at = Column(
        DateTime,
        server_default=text("(datetime('now'))"),
        onupdate=text("(datetime('now'))"),
        nullable=False
    )
    deleted_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="collections")
    records = relationship("Record", back_populates="collection", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<Collection {self.name} (user: {self.user_id})>"
