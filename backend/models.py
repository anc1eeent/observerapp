from backend.database import Base
from sqlalchemy import create_engine, Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    email = Column(String, unique=True, index=True, nullable=True)
    avatar_url = Column(String, nullable=True)
    tasks = relationship("Task", back_populates="owner")
    pomodoros = relationship("PomodoroStats", back_populates="Owner")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    completed = Column(Boolean, default=False)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="tasks")
    pomodoros = relationship("PomodoroStats", back_populates="task")

class PomodoroStats(Base):
    __tablename__ = "PomodoroStats"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    duration_secods = Column(Integer, nullable=False, default=0)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True) 
    description = Column(String, nullable=True)
    owner = relationship("User", back_populates="PomodoroStats")
    tasks = relationship("Task", back_populates="PomodoroStats")
