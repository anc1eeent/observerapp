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
     