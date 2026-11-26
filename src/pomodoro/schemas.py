"""
Pydantic schemas for data validation and serialization.
These models define the shape of requests coming IN (Create/Update) 
and responses going OUT (Response) of our API.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class PomodoroCreate(BaseModel):
    """Schema for logging a completed Pomodoro session."""
    # A session lasts more than zero seconds and at most one day.
    duration_seconds: int = Field(gt=0, le=24 * 60 * 60)
    task_id: Optional[int] = None
    description: str | None = Field(default=None, max_length=2000)

class PomodoroResponse(BaseModel):
    """Schema for returning Pomodoro history."""
    id: int
    owner_id: int
    duration_seconds: int
    task_id: Optional[int] = None
    description: str | None = None
    model_config = ConfigDict(from_attributes=True)