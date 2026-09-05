from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend import models, schemas, crud, security
from backend.database import get_db
from backend.routes.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=schemas.UserProfile)

async def read_user_me(current_user: models.User = Depends(get_current_user)):
  return current_user

@router.patch("/me/profile", response_model=schemas.UserProfile)
async def update_profile(update_data: schemas.UserUpdate,
                         current_user: models.User = Depends(get_current_user),
                         db: Session = Depends(get_db)):
  update_dict = update_data.model_dump(exclude_unset=True)
  updated_user = crud.update_user_profile(db, current_user, update_dict)
  return updated_user

@router.patch("me/password", response_model=schemas.UserProfile)
async def update_password(
  password_data: schemas.UserPasswordUpdate,
  current_user: models.User = Depends(get_current_user),
  db: Session = Depends(get_db)
):
  if not security.verify_password(password_data.old_password, current_user.hashed_password):
    raise HTTPException(status_code=400, detail="[ERROR] Incorrect old password, try again.")
  new_hashed_password = security.get_password_hash(password_data.new_password)
  updated_user = crud.update_user_password(db, current_user, new_hashed_password)
  return updated_user

  