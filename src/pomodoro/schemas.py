"""
Pydantic schemas for data validation and serialization.
These models define the shape of requests coming IN (Create/Update) 
and responses going OUT (Response) of our API.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

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
    model_config = ConfigDict(from_attributes=True)