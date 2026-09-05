from sqlalchemy.orm import Session
from backend import models
from backend import schemas

def get_user_by_username(db: Session, username: str):
     return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate, hashed_password: str):
     new_user = models.User(username=user.username, hashed_password=hashed_password)
     db.add(new_user)
     db.commit()
     db.refresh(new_user)
     return new_user

def create_task(db: Session, task: schemas.TaskCreate, owner_id: int):
     new_task = models.Task(title=task.title, description=task.description, owner_id=owner_id)
     db.add(new_task)
     db.commit()
     db.refresh(new_task)
     return new_task

def get_tasks(db: Session, owner_id: int):
     return db.query(models.Task).filter(models.Task.owner_id == owner_id).all()

def update_task(db: Session, task_id: int, task_update: dict):
     db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
     if db_task:
          for key, value in task_update.items():
               setattr(db_task, key, value)
          db.commit()
          db.refresh(db_task)
     return db_task

def delete_task(db: Session, task_id: int):
     db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
     if db_task:
          db.delete(db_task)
          db.commit()
     return db_task
     
def create_pomodoro(db: Session, pomodoro: schemas.PomodoroCreate, owner_id: int):
     new_pomodoro = models.PomodoroStats(duration_seconds=pomodoro.duration_seconds, 
                                         description=pomodoro.description,
                                         owner_id=owner_id,
                                         task_id=pomodoro.task_id)
     db.add(new_pomodoro)
     db.commit()
     db.refresh(new_pomodoro)
     return new_pomodoro

def get_pomodoro(db: Session, owner_id: int):
     return db.query(models.PomodoroStats).filter(models.PomodoroStats.owner_id == owner_id).all()

    