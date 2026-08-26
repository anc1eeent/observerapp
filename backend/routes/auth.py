from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.orm import Session
import models, schemas, security, crud
from database import get_db

router = APIRouter(tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials")
    try:
       payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
       username = payload.get("sub")
       if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    db_user = db.query(models.User).filter(models.User.username == username).first()
    if db_user is None:
        raise credentials_exception
    return db_user

@router.post("/login")

def login_user(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, user.username)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    is_password_valid = security.verify_password(user.password, db_user.hashed_password)
    if not is_password_valid:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = security.create_access_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register")

def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, user.username)
    if db_user:
        raise HTTPException(status_code=409, detail="Username alredy registered")
    hashed_pw = security.get_password_hash(user.password)
    new_user = crud.create_user(db, user, hashed_pw)
    return {"status": "success", "user_id": new_user.id, "username": new_user.username}