"""
CRUD (Create, Read, Update, Delete) database operations.
This module acts as the Repository layer, abstracting SQLAlchemy logic 
away from the API endpoints.
"""
from sqlalchemy import func
from sqlalchemy.orm import Session
from src.pomodoro.models import PomodoroStats
from src.tasks import models
from src.tasks import schemas

# ==========================================
# TASK OPERATIONS
# ==========================================

def create_task_list(db: Session, task_list: schemas.TaskListCreate, owner_id: int):
    """Create a new task list linked to user."""
    new_list = models.TaskList(
        name=task_list.name,
        color=task_list.color,
        owner_id=owner_id
    )
    db.add(new_list)
    db.commit()
    db.refresh(new_list)
    return new_list

def get_task_lists(db: Session, owner_id: int):
    """Retrieve all task lists belonging to a specific user."""
    return db.query(models.TaskList).filter(models.TaskList.owner_id == owner_id).all()

def get_task_for_owner(db: Session, task_id: int, owner_id: int):
     """Return the task if it exists and belongs to the user, otherwise None."""
     return (
          db.query(models.Task)
          .filter(models.Task.id == task_id, models.Task.owner_id == owner_id)
          .first()
     )

def get_task_list_for_owner(db: Session, list_id: int, owner_id: int):
     """Return the task list if it exists and belongs to the user, otherwise None."""
     return (
          db.query(models.TaskList)
          .filter(models.TaskList.id == list_id, models.TaskList.owner_id == owner_id)
          .first()
     )

def create_task(db: Session, task: schemas.TaskCreate, owner_id: int):
     """Create a new task linked to the user who requested it."""
     new_task = models.Task(
          title=task.title,
          description=task.description,
          list_id=task.list_id,
          priority=task.priority,
          due_date=task.due_date,
          owner_id=owner_id,
     )
     db.add(new_task)
     db.commit()
     db.refresh(new_task)
     return new_task

def get_focus_totals(db: Session, owner_id: int) -> dict[int, int]:
     """Return {task_id: total seconds of Pomodoro sessions} for the user's tasks."""
     rows = (
          db.query(PomodoroStats.task_id, func.sum(PomodoroStats.duration_seconds))
          .filter(PomodoroStats.owner_id == owner_id, PomodoroStats.task_id.isnot(None))
          .group_by(PomodoroStats.task_id)
          .all()
     )
     return {task_id: int(total) for task_id, total in rows}

def get_tasks(db: Session, owner_id: int, list_id: int = None):
     """Retrieve all tasks belonging to a specific user, with their focus time."""
     query = db.query(models.Task).filter(models.Task.owner_id == owner_id)
     if list_id is not None:
        query = query.filter(models.Task.list_id == list_id)
     tasks = query.order_by(models.Task.id).all()

     focus_totals = get_focus_totals(db, owner_id)
     for task in tasks:
          # Plain attribute, not a column: read by TaskResponse.focus_seconds
          task.focus_seconds = focus_totals.get(task.id, 0)
     return tasks

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
