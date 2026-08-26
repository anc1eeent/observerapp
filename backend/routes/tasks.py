from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, security, crud
from database import get_db
from routes.auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/", response_model=schemas.TaskResponse)

def create_new_task(task: schemas.TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_task(db, task, owner_id=current_user.id)
    
@router.get("/", response_model=list[schemas.TaskResponse])

def read_tasks(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_tasks(db, owner_id=current_user.id)
