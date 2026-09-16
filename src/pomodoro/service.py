"""
CRUD (Create, Read, Update, Delete) database operations.
This module acts as the Repository layer, abstracting SQLAlchemy logic 
away from the API endpoints.
"""
from sqlalchemy.orm import Session
from src.pomodoro import models, schemas

def create_pomodoro(db: Session, pomodoro: schemas.PomodoroCreate, owner_id: int):
     """Log a completed focus session, optionally linking it to a specific task."""
     new_pomodoro = models.PomodoroStats(duration_seconds=pomodoro.duration_seconds, 
                                         description=pomodoro.description,
                                         owner_id=owner_id,
                                         task_id=pomodoro.task_id)
     db.add(new_pomodoro)
     db.commit()
     db.refresh(new_pomodoro)
     return new_pomodoro

def get_pomodoro(db: Session, owner_id: int):
     """Retrieve the complete Pomodoro history for a specific user."""
     return db.query(models.PomodoroStats).filter(models.PomodoroStats.owner_id == owner_id).all()

    