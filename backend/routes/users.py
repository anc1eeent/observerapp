from fastapi import APIRouter, Depends
from backend import models, schemas
from backend.routes.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=schemas.UserProfile)

async def read_user_me(current_user: models.User = Depends(get_current_user)):
  return current_user