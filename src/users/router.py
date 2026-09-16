from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from src.users import models, schemas, service, security
from src.dependencies import get_db
from src.users.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

# ==========================================
# AUTH & REGISTRATION ENDPOINTS
# ==========================================

@router.post("/login")

def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = service.get_user_by_username(db, form_data.username)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    is_password_valid = security.verify_password(form_data.password, db_user.hashed_password)
    if not is_password_valid:
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    access_token = security.create_access_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register")

def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = service.get_user_by_username(db, user.username)
    if db_user:
        raise HTTPException(status_code=409, detail="Username alredy registered")
    hashed_pw = security.get_password_hash(user.password)
    new_user = service.create_user(db, user, hashed_pw)
    return {"status": "success", "user_id": new_user.id, "username": new_user.username}

# ==========================================
# USER PROFILE ENDPOINTS
# ==========================================

@router.get("/me", response_model=schemas.UserProfile)

async def read_user_me(current_user: models.User = Depends(get_current_user)):
  return current_user

@router.patch("/me/profile", response_model=schemas.UserProfile)
async def update_profile(update_data: schemas.UserUpdate,
                         current_user: models.User = Depends(get_current_user),
                         db: Session = Depends(get_db)):
  update_dict = update_data.model_dump(exclude_unset=True)
  updated_user = service.update_user_profile(db, current_user, update_dict)
  return updated_user

@router.patch("/me/password", response_model=schemas.UserProfile)
async def update_password(
  password_data: schemas.UserPasswordUpdate,
  current_user: models.User = Depends(get_current_user),
  db: Session = Depends(get_db)
):
  if not security.verify_password(password_data.old_password, current_user.hashed_password):
    raise HTTPException(status_code=400, detail="[ERROR] Incorrect old password, try again.")
  new_hashed_password = security.get_password_hash(password_data.new_password)
  updated_user = service.update_user_password(db, current_user, new_hashed_password)
  return updated_user

  