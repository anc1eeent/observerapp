from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend import models, schemas, security, crud
from backend.database import get_db
from backend.routes.auth import get_current_user

router = APIRouter(prefix="/pomodoro", tags=["Pomodoro"])

@router.post("/", response_model=schemas.PomodoroResponse)

def create_new_pomodoro(pomodoro: schemas.PomodoroCreate, 
                        db: Session = Depends(get_db), 
                        current_user: models.User = Depends(get_current_user)):
    return crud.create_pomodoro(db, pomodoro, owner_id=current_user.id)

@router.get("/", response_model=list[schemas.PomodoroResponse])

def read_pomodoros(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_pomodoro(db, owner_id=current_user.id)