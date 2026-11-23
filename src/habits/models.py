"""
Database models definition.
This module maps Python classes to database tables using SQLAlchemy ORM.
"""
import enum
from sqlalchemy import Enum as SqlEnum
from src.database import Base
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy import Date, DateTime, CheckConstraint, UniqueConstraint, func
from sqlalchemy.orm import relationship

class HabitStatus(str, enum.Enum):
    ACTIVE = "active"
    FORMED = "formed"
    EXPIRED = "expired"

class HabitCheckInStatus(str, enum.Enum):
    DONE = "done"
    NOT_DONE = "not_done"


class Habit(Base):
    __tablename__ = "habits"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True) 
    title = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    status = Column(SqlEnum(HabitStatus, name="habit_status"), nullable=False, default=HabitStatus.ACTIVE)
    allow_backfill = Column(Boolean, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    owner = relationship("User", back_populates="habits")
    schedule_versions = relationship("HabitScheduleVersion", back_populates="habit", cascade="all, delete-orphan")
    check_ins = relationship("HabitCheckIn", back_populates="habit", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint(
            "end_date IS NULL OR end_date >= start_date",
            name="ck_habits_end_date_not_before_start_date",
        ),
    )


class HabitScheduleVersion(Base):
    __tablename__ = "habit_schedule_versions"
    id = Column(Integer, primary_key=True, index=True)
    habit_id =  Column(Integer, ForeignKey("habits.id", ondelete="CASCADE"), nullable=False, index=True)
    effective_from = Column(Date, nullable=False)
    monday = Column(Boolean, nullable=False)
    tuesday = Column(Boolean, nullable=False)
    wednesday = Column(Boolean, nullable=False)
    thursday = Column(Boolean, nullable=False)
    friday = Column(Boolean, nullable=False)
    saturday = Column(Boolean, nullable=False)
    sunday = Column(Boolean, nullable=False)
    daily_target_minutes = Column(Integer, nullable=True)

    habit = relationship("Habit", back_populates="schedule_versions")

    __table_args__ = (
        UniqueConstraint(
            "habit_id",
            "effective_from",
            name="uq_habit_schedule_versions_habit_effective_from",
        ),
        CheckConstraint(
            "monday OR tuesday OR wednesday OR thursday OR friday OR saturday OR sunday",
            name="ck_habit_schedule_versions_at_least_one_weekday",
        ),
        CheckConstraint(
            "daily_target_minutes IS NULL OR daily_target_minutes > 0",
            name="ck_habit_schedule_versions_daily_target_positive"
        )
    )

class HabitCheckIn(Base):
    __tablename__ = "habit_check_ins"
    id = Column(Integer, primary_key=True, index=True)
    habit_id =  Column(Integer, ForeignKey("habits.id", ondelete="CASCADE"), nullable=False, index=True)
    tracked_date = Column(Date, nullable=False)
    status = Column(SqlEnum(HabitCheckInStatus, name="habit_check_in_status"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    habit = relationship("Habit", back_populates="check_ins")

    __table_args__ = (
        UniqueConstraint(
            "habit_id",
            "tracked_date",
            name="uq_habit_check_ins_habit_tracked_date",
        ),
    )