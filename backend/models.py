"""
Database models definition.
This module maps Python classes to database tables using SQLAlchemy ORM.
"""

from backend.database import Base
from sqlalchemy import create_engine, Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

class User(Base):
    """ Represent a registered user in the system. """
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    # Optional fields
    email = Column(String, unique=True, index=True, nullable=True)
    avatar_url = Column(String, nullable=True)

    # ORM Relationships: Allow accessing user.tasks and user.pomodoros.
    tasks = relationship("Task", back_populates="owner")
    pomodoros = relationship("PomodoroStats", back_populates="owner")
    task_list = relationship("TaskList", back_populates="owner")

class TaskList(Base):
    __tablename__ = "task_lists"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    color = Column(String, default="#FFFFFF")
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="task_list")
    tasks = relationship("Task", back_populates="task_list")

class Task(Base):
    """Represents a to-do item created by a user."""
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)

    # New tasks are marked as incomplete by
    completed = Column(Boolean, default=False)

    # Foreign key establishes the database-level link to the users table
    owner_id = Column(Integer, ForeignKey("users.id"))

    list_id = Column(Integer, ForeignKey("task_lists.id"), nullable=True)
    owner = relationship("User", back_populates="tasks")
    pomodoros = relationship("PomodoroStats", back_populates="task")
    task_list = relationship("TaskList", back_populates="tasks")
    

class PomodoroStats(Base):
    """Tracks time spent on tasks or general focus sessions."""
    __tablename__ = "PomodoroStats"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Duration of the focus session in seconds
    duration_seconds = Column(Integer, nullable=False, default=0)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True) 
    description = Column(String, nullable=True)
    owner = relationship("User", back_populates="pomodoros")
    task = relationship("Task", back_populates="pomodoros")
