from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from src.users import models as user_models
from src.tasks import models, schemas, service
from src.dependencies import get_db
from src.users.dependencies import get_current_user
from typing import Optional
from src.tasks.service import create_task, get_tasks

router = APIRouter(prefix="/tasks", tags=["Tasks"])

TASK_NOT_FOUND = "[ERROR] Task was not found."
LIST_NOT_FOUND = "[ERROR] Task list was not found."


def ensure_list_belongs_to_user(db: Session, list_id: Optional[int], owner_id: int):
    """Raise 404 if a task refers to a list that does not exist or belongs to another user."""
    if list_id is not None and not service.get_task_list_for_owner(db, list_id, owner_id):
        raise HTTPException(status_code=404, detail=LIST_NOT_FOUND)

@router.post("/", response_model=schemas.TaskResponse)

def create_new_task(task: schemas.TaskCreate, db: Session = Depends(get_db), current_user: user_models.User = Depends(get_current_user)):
    ensure_list_belongs_to_user(db, task.list_id, current_user.id)
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
    if not service.get_task_for_owner(db, task_id, current_user.id):
        raise HTTPException(status_code=404, detail=TASK_NOT_FOUND)
    service.delete_task(db, task_id)
    return {"message": "Task was deleted successfully."}

@router.put("/{task_id}", response_model=schemas.TaskResponse)

def update_task(task_id: int, 
                task_data: schemas.TaskUpdate, 
                db: Session = Depends(get_db), 
                current_user: user_models.User = Depends(get_current_user)):
    if not service.get_task_for_owner(db, task_id, current_user.id):
        raise HTTPException(status_code=404, detail=TASK_NOT_FOUND)
    update_data = task_data.model_dump(exclude_unset=True)
    ensure_list_belongs_to_user(db, update_data.get("list_id"), current_user.id)
    return service.update_task(db, task_id, update_data)
