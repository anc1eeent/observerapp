"""
Pydantic schemas for data validation and serialization.
These models define the shape of requests coming IN (Create/Update) 
and responses going OUT (Response) of our API.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

# ==========================================
# TASK_LIST SCHEMAS
# ==========================================

class TaskListCreate(BaseModel):
    """Schema for creating a new task lsit."""
    name: str
    color: Optional[str] = "#FFFFFF"

class TaskListResponse(TaskListCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)

# ==========================================
# TASK SCHEMAS
# ==========================================

class TaskBase(BaseModel):
    """Base schema for tasks"""
    title: str
    description: str | None = None
    list_id: Optional[int] = None

class TaskCreate(TaskBase):
    """From base TaskBase schema"""
    pass

class TaskResponse(TaskBase):
    """Schema for returning tasks."""
    id: int
    completed: bool
    owner_id: int
    model_config = ConfigDict(from_attributes=True)

class TaskUpdate(BaseModel):
    """Schema for partially updating a task."""
    title: Optional[str] = None
    description: Optional[str] = None
    list_id: Optional[int] = None
    completed: Optional[bool] = None