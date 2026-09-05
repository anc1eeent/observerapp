"""
Pydantic schemas for data validation and serialization.
These models define the shape of requests coming IN (Create/Update) 
and responses going OUT (Response) of our API.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

# ==========================================
# USER SCHEMAS
# ==========================================

class UserCreate(BaseModel):
    """Schema for registering a new user."""
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8)

class UserLogin(BaseModel):
    """Schema for user authentication."""
    username: str
    password: str

class UserProfile(BaseModel):
    """Schema for returning user data 
    (excludes sensitive info like passwords)."""
    id: int
    username: str
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# TASK SCHEMAS
# ==========================================

class TaskCreate(BaseModel):
    """Schema for creating a new task."""
    title: str
    description: str | None = None

class TaskResponse(BaseModel):
    """
    Schema for partially updating an existing task.
    All fields are optional so the client can update just one specific field.
    """
    id: int
    title: str
    description: str | None = None
    completed: bool
    owner_id: int
    model_config = ConfigDict(from_attributes=True)

class TaskUpdate(BaseModel):
    """Schema for returning task data to the client."""
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None

# ==========================================
# POMODORO SCHEMAS
# ==========================================
    
class PomodoroCreate(BaseModel):
    """Schema for logging a completed Pomodoro session."""
    duration_seconds: int
    task_id: Optional[int] = None
    description: str | None = None

class PomodoroResponse(BaseModel):
    """Schema for returning Pomodoro history."""
    id: int
    owner_id: int
    duration_seconds: int
    task_id: Optional[int] = None
    description: str | None = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)