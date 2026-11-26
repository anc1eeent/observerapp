"""
Pydantic schemas for data validation and serialization.
These models define the shape of requests coming IN (Create/Update) 
and responses going OUT (Response) of our API.
"""
from typing import Annotated, Optional

from pydantic import BaseModel, ConfigDict, StringConstraints

# A title must contain at least one non-space character.
Title = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]
Description = Annotated[str, StringConstraints(max_length=2000)]

# ==========================================
# TASK_LIST SCHEMAS
# ==========================================

class TaskListCreate(BaseModel):
    """Schema for creating a new task list."""
    name: Title
    color: Optional[str] = "#FFFFFF"

class TaskListResponse(TaskListCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)

# ==========================================
# TASK SCHEMAS
# ==========================================

class TaskBase(BaseModel):
    """Base schema for tasks"""
    title: Title
    description: Description | None = None
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
    title: Optional[Title] = None
    description: Optional[Description] = None
    list_id: Optional[int] = None
    completed: Optional[bool] = None