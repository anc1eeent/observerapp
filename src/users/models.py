"""
Database models definition.
This module maps Python classes to database tables using SQLAlchemy ORM.
"""

from src.database import Base
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
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
    tasks = relationship("Task", back_populates="owner", cascade="all, delete-orphan")
    pomodoros = relationship("PomodoroStats", back_populates="owner", cascade="all, delete-orphan")
    task_list = relationship("TaskList", back_populates="owner", cascade="all, delete-orphan")
