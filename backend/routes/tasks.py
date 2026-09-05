from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend import models, schemas, security, crud
from backend.database import get_db
from backend.routes.auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/", response_model=schemas.TaskResponse)

def create_new_task(task: schemas.TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_task(db, task, owner_id=current_user.id)
    
@router.get("/", response_model=list[schemas.TaskResponse])

def read_tasks(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_tasks(db, owner_id=current_user.id)

@router.delete("/{task_id}")

def delete_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task or db_task.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="[ERROR] Task was not found.")
    crud.delete_task(db, task_id)
    return {"message": "Task was deleted successfully."}

@router.put("/{task_id}", response_model=schemas.Task)

def update_task(task_id: int, task_data: schemas.TaskUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task or db_task.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="[ERROR] Task was not found.")
    update_data = task_data.dict(exclude_unset=True)
    return crud.update_task(db, task_id, update_data)
