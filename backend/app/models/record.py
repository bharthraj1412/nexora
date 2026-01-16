"""
Record model for collection entries.
"""
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON, text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Record(Base):
    """Data record in a collection."""
    
    __tablename__ = "records"
    
    # Primary key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Collection relationship
    collection_id = Column(String, ForeignKey("collections.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Record data (flexible JSON structure)
    data = Column(JSON, nullable=False, default=dict)
    
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
    collection = relationship("Collection", back_populates="records")
    
    def __repr__(self) -> str:
        return f"<Record {self.id} in collection {self.collection_id}>"
