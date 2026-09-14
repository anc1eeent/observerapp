"""
Database models definition.
This module maps Python classes to database tables using SQLAlchemy ORM.
"""

from src.database import Base
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

class Task(Base):
    """Represents a to-do item created by a user."""
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)

    # New tasks are marked as incomplete by
    completed = Column(Boolean, default=False)

    # Foreign key establishes the database-level link to the users table
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    list_id = Column(Integer, ForeignKey("task_lists.id", ondelete="CASCADE"), nullable=True)
    owner = relationship("User", back_populates="tasks")
    pomodoros = relationship("PomodoroStats", back_populates="task")
    task_list = relationship("TaskList", back_populates="tasks")

class TaskList(Base):
    __tablename__ = "task_lists"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    color = Column(String, default="#FFFFFF")
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    owner = relationship("User", back_populates="task_list")
    tasks = relationship("Task", back_populates="task_list")