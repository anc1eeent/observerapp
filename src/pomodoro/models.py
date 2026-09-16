"""
Database models definition.
This module maps Python classes to database tables using SQLAlchemy ORM.
"""

from src.database import Base
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

class PomodoroStats(Base):
    """Tracks time spent on tasks or general focus sessions."""
    __tablename__ = "pomodoro_stats"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Duration of the focus session in seconds
    duration_seconds = Column(Integer, nullable=False, default=0)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=True) 
    description = Column(String, nullable=True)
    owner = relationship("User", back_populates="pomodoros")
    task = relationship("Task", back_populates="pomodoros")
