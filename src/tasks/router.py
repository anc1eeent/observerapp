from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from src.users import models as user_models
from src.tasks import models, schemas, service
from src.dependencies import get_db
from src.users.dependencies import get_current_user
from typing import Optional
from src.tasks.service import create_task, get_tasks

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/", response_model=schemas.TaskResponse)

def create_new_task(task: schemas.TaskCreate, db: Session = Depends(get_db), current_user: user_models.User = Depends(get_current_user)):
    return create_task(db, task, owner_id=current_user.id)
    
@router.get("/", response_model=list[schemas.TaskResponse])

def read_tasks(
    list_id: Optional[int] = Query(None, description="Filter tasks by list ID"),
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user) 
):
    return get_tasks(db=db, owner_id=current_user.id, list_id=list_id)

@router.delete("/{task_id}")

def delete_task(task_id: int, 
                db: Session = Depends(get_db), 
                current_user: user_models.User = Depends(get_current_user)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task or db_task.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="[ERROR] Task was not found.")
    service.delete_task(db, task_id)
    return {"message": "Task was deleted successfully."}

@router.put("/{task_id}", response_model=schemas.TaskResponse)

def update_task(task_id: int, 
                task_data: schemas.TaskUpdate, 
                db: Session = Depends(get_db), 
                current_user: user_models.User = Depends(get_current_user)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task or db_task.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="[ERROR] Task was not found.")
    update_data = task_data.dict(exclude_unset=True)
    return service.update_task(db, task_id, update_data)
