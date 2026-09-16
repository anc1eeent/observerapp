from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.users import models as user_models
from src.pomodoro import models, schemas, service
from src.dependencies import get_db
from src.users.dependencies import get_current_user

router = APIRouter(prefix="/pomodoro", tags=["Pomodoro"])

@router.post("/", response_model=schemas.PomodoroResponse)

def create_new_pomodoro(pomodoro: schemas.PomodoroCreate, 
                        db: Session = Depends(get_db), 
                        current_user: user_models.User = Depends(get_current_user)):
    return service.create_pomodoro(db, pomodoro, owner_id=current_user.id)

@router.get("/", response_model=list[schemas.PomodoroResponse])

def read_pomodoros(db: Session = Depends(get_db), current_user: user_models.User = Depends(get_current_user)):
    return service.get_pomodoro(db, owner_id=current_user.id)