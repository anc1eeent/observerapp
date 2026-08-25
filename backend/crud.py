from sqlalchemy.orm import Session
import models
import schemas

def get_user_by_username(db: Session, username: str):
     db_user = db.query(models.User).filter(models.User.username == username).first()
     return db_user

def create_user(db: Session, user: schemas.UserCreate, hashed_password: str):
     new_user = models.User(username=user.username, hashed_password=hashed_password)
     db.add(new_user)
     db.commit()
     db.refresh(new_user)
     return new_user