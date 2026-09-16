from sqlalchemy.orm import Session
from src.users import models, schemas

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

def update_user_profile(db: Session, db_user: models.User, update_data: dict):
     """
     Updates the user's profile information(email, avatar_url).
     """
     for key, value in update_data.items():
          setattr(db_user, key, value)
     db.commit()
     db.refresh(db_user)
     return db_user

def update_user_password(db: Session, db_user: models.User, new_hashed_password: str):
     """
     Update the user's password with a new securely hashed password.
     """
     db_user.hashed_password = new_hashed_password
     db.commit()
     db.refresh(db_user)
     return db_user