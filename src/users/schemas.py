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

class UserPasswordUpdate(BaseModel):
    """Schema for user password update"""
    old_password: str
    new_password: str = Field(min_length=8)


class UserProfile(BaseModel):
    """Schema for returning user data 
    (excludes sensitive info like passwords)."""
    id: int
    username: str
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    """Schema for updating profile"""
    email: Optional[str] = None
    avatar_url: Optional[str] = None