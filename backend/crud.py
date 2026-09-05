"""
CRUD (Create, Read, Update, Delete) database operations.
This module acts as the Repository layer, abstracting SQLAlchemy logic 
away from the API endpoints.
"""
from sqlalchemy.orm import Session
from backend import models
from backend import schemas

# ==========================================
# USER OPERATIONS
# ==========================================

def get_user_by_username(db: Session, username: str):
     """Retrieve a user by their unique username. Used for authentication."""
     return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate, hashed_password: str):
     """Create a new user record with a safely hashed password."""
     new_user = models.User(username=user.username, hashed_password=hashed_password)
     db.add(new_user)
     db.commit()
     # Refresh to pull the auto-generated ID from the database
     db.refresh(new_user)
     return new_user

# ==========================================
# TASK OPERATIONS
# ==========================================

def create_task(db: Session, task: schemas.TaskCreate, owner_id: int):
     """Create a new task linked to the user who requested it."""
     new_task = models.Task(title=task.title, description=task.description, owner_id=owner_id)
     db.add(new_task)
     db.commit()
     db.refresh(new_task)
     return new_task

def get_tasks(db: Session, owner_id: int):
     """Retrieve all tasks belonging to a specific user."""
     return db.query(models.Task).filter(models.Task.owner_id == owner_id).all()

def update_task(db: Session, task_id: int, task_update: dict):
     """
    Partially update a task. 
    Iterates through the provided dictionary and dynamically updates object attributes.
    """
     db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
     if db_task:
          for key, value in task_update.items():
               setattr(db_task, key, value)
          db.commit()
          db.refresh(db_task)
     return db_task

def delete_task(db: Session, task_id: int):
     """Delete a task from the database by its ID."""
     db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
     if db_task:
          db.delete(db_task)
          db.commit()
     return db_task

# ==========================================
# POMODORO OPERATIONS
# ==========================================
     
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

    