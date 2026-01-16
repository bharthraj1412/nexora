"""
Activity log model for audit trail.
"""
import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, text
from sqlalchemy.orm import relationship

from app.core.database import Base


class ActivityLog(Base):
    """Audit log for user activities."""
    
    __tablename__ = "activity_logs"
    
    # Primary key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # User relationship
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Activity details
    action = Column(String, nullable=False)  # 'created', 'updated', 'deleted', etc.
    entity_type = Column(String, nullable=False)  # 'collection', 'record', 'user', etc.
    entity_id = Column(String, nullable=False)
    
    # Change details (before/after values)
    changes = Column(JSON, nullable=True)
    
    # Request metadata
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    
    # Timestamp - Database-generated UTC (immutable)
    created_at = Column(
        DateTime,
        server_default=text("(datetime('now'))"),
        nullable=False,
        index=True
    )
    
    # Relationships
    user = relationship("User", back_populates="activity_logs")
    
    def __repr__(self) -> str:
        return f"<ActivityLog {self.action} {self.entity_type}:{self.entity_id}>"
