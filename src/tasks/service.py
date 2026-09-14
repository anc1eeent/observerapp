"""
CRUD (Create, Read, Update, Delete) database operations.
This module acts as the Repository layer, abstracting SQLAlchemy logic 
away from the API endpoints.
"""
from sqlalchemy.orm import Session
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

def create_task(db: Session, task: schemas.TaskCreate, owner_id: int):
     """Create a new task linked to the user who requested it."""
     new_task = models.Task(title=task.title, list_id=task.list_id ,description=task.description, owner_id=owner_id)
     db.add(new_task)
     db.commit()
     db.refresh(new_task)
     return new_task

def get_tasks(db: Session, owner_id: int, list_id: int = None):
     """Retrieve all tasks belonging to a specific user."""
     query = db.query(models.Task).filter(models.Task.owner_id == owner_id)
     if list_id is not None:
        query = query.filter(models.Task.list_id == list_id)
     return query.all()

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