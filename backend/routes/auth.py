from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, security, crud
from database import get_db

router = APIRouter(tags=["Authentication"])

@router.post("/login")

def login_user(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, user.username)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    is_password_valid = security.verify_password(user.password, db_user.hashed_password)
    if not is_password_valid:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = security.create_access_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register")

def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, user.username)
    if db_user:
        raise HTTPException(status_code=409, detail="Username alredy registered")
    hashed_pw = security.get_password_hash(user.password)
    new_user = crud.create_user(db, user, hashed_pw)
    return {"status": "success", "user_id": new_user.id, "username": new_user.username}