import jwt
import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from dotenv import load_dotenv
from database import get_db
from passlib.context import CryptContext
from models import User
from schemas.user_schema import UserResponse, TokenResponse, UserRole, PasswordChangeRequest

load_dotenv()  # .env 파일 로드

router = APIRouter()

# 일반 사용자와 관리자 각각의 OAuth2 스킴
user_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
admin_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="admin/login")

# 환경 변수에서 비밀 키 가져오기
SECRET_KEY = os.getenv("SECRET_KEY")  # .env 파일에서 비밀 키 가져오기
if not SECRET_KEY:
    raise ValueError("No SECRET_KEY set for JWT in environment")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# 비밀번호 해싱을 위한 설정
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 비밀번호 해싱 함수
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# 비밀번호 검증 함수
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# JWT 액세스 토큰 생성 함수
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# 일반 사용자 JWT에서 현재 사용자 가져오기
async def get_current_user(token: str = Depends(user_oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

# 관리자 JWT에서 현재 사용자 가져오기
async def get_current_admin(token: str = Depends(admin_oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id, User.role == UserRole.admin).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

# 일반 사용자 로그인 엔드포인트
@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_201_CREATED, summary="일반 사용자 로그인", tags=["인증 API"])
async def user_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == form_data.username, User.role == UserRole.user).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.id, "role": user.role}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

# 관리자 로그인 엔드포인트
@router.post("/admin/login", response_model=TokenResponse, status_code=status.HTTP_201_CREATED, summary="관리자 로그인", tags=["인증 API"])
async def admin_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    admin = db.query(User).filter(User.id == form_data.username, User.role == UserRole.admin).first()
    if not admin or not verify_password(form_data.password, admin.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": admin.id, "role": admin.role}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

# 일반 사용자 비밀번호 변경 엔드포인트
@router.put("/user/change-password", summary="일반 사용자 비밀번호 변경", tags=["인증 API"])
async def change_user_password(
    password_data: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(password_data.old_password, current_user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Old password is incorrect")

    # 새 비밀번호 저장
    hashed_new_password = hash_password(password_data.new_password)
    current_user.password = hashed_new_password
    db.commit()

    return {"message": "Password changed successfully"}

# 관리자 비밀번호 변경 엔드포인트
@router.put("/admin/change-password", summary="관리자 비밀번호 변경", tags=["인증 API"])
async def change_admin_password(
    password_data: PasswordChangeRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if not verify_password(password_data.old_password, current_admin.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Old password is incorrect")

    # 새 비밀번호 저장
    hashed_new_password = hash_password(password_data.new_password)
    current_admin.password = hashed_new_password
    db.commit()

    return {"message": "Admin password changed successfully"}
