from pydantic import BaseModel, Field
from typing import Optional

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8)

class UserLogin(BaseModel):
    username: str
    password: str

class TaskCreate(BaseModel):
    title: str
    description: str | None = None

class TaskResponse(BaseModel):
    id: int
    title: str
    description: str | None = None
    completed: bool
    owner_id: int

    class Config:
        from_attributes = True

class UserProfile(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True
    

