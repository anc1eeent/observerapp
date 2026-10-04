"""
Database models definition.
This module maps Python classes to database tables using SQLAlchemy ORM.
"""
import enum
from sqlalchemy import Enum as SqlEnum
from src.database import Base
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, DateTime, CheckConstraint, func
from sqlalchemy.orm import relationship

class HabitStatus(str, enum.Enum):
    ACTIVE = "active"
    FORMED = "formed"
    EXPIRED = "expired"

class Habit(Base):
    __tablename__ = "habits"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True) 
    title = Column(String, nullable=False)
    start_date = Column(Date,nullable=False)
    end_date = Column(Date, nullable=True)
    status = Column(SqlEnum(HabitStatus, name="habit_status"), nullable=False, default=HabitStatus.ACTIVE)
    allow_backfill = Column(Boolean, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    owner = relationship("User", back_populates="habits")

    __table_args__ = (
        CheckConstraint(
            "end_Date IS NULL OR end_date >= start_date",
            name="ck_habits_end_date_not_before_Start_date",
        ),
    )