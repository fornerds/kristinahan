import jwt
import os
from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from database import get_db
from passlib.context import CryptContext
from models import User
from schemas.user_schema import TokenResponse, UserRole, PasswordChangeRequest

load_dotenv()  # .env 파일 로드

router = APIRouter()

# 사용자와 관리자 각각의 OAuth2 스킴 정의
user_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
admin_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="admin/login")

# 환경 변수에서 비밀 키 가져오기
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("No SECRET_KEY set for JWT in environment")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# 비밀번호 해싱 및 검증 설정
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
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})  # 토큰 발급 시간 추가
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# 커스텀 폼 정의: username 대신 id와 password만 사용
class OAuth2PasswordRequestFormCustom:
    def __init__(
        self,
        id: int = Form(..., description="User ID 대신 사용"),
        password: str = Form(..., description="비밀번호"),
    ):
        self.id = id
        self.password = password

# 일반 사용자 JWT에서 현재 사용자 가져오기
async def get_current_user(token: str = Depends(user_oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="인증 자격 증명이 잘못되었습니다.")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="토큰이 만료되었습니다.")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="유효하지 않은 토큰입니다.")

# 관리자 JWT에서 현재 사용자 가져오기
async def get_current_admin(token: str = Depends(admin_oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id, User.role == UserRole.admin).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="인증 자격 증명이 잘못되었습니다.")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="토큰이 만료되었습니다.")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="유효하지 않은 토큰입니다.")

# 일반 사용자 로그인 엔드포인트 수정: 커스텀 폼 사용
@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_201_CREATED, summary="일반 사용자 로그인", tags=["인증 API"])
async def user_login(form_data: OAuth2PasswordRequestFormCustom = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == form_data.id, User.role == UserRole.user).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="ID 또는 비밀번호가 올바르지 않습니다.")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.id, "role": user.role}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

# 관리자 로그인 엔드포인트 수정: 커스텀 폼 사용
@router.post("/admin/login", response_model=TokenResponse, status_code=status.HTTP_201_CREATED, summary="관리자 로그인", tags=["인증 API"])
async def admin_login(form_data: OAuth2PasswordRequestFormCustom = Depends(), db: Session = Depends(get_db)):
    admin = db.query(User).filter(User.id == form_data.id, User.role == UserRole.admin).first()
    if not admin or not verify_password(form_data.password, admin.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="ID 또는 비밀번호가 올바르지 않습니다.")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": admin.id, "role": admin.role}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

# 일반 사용자 비밀번호 변경 엔드포인트 (관리자 권한 필요)
@router.put("/user/change-password", summary="일반 사용자 비밀번호 변경 (어드민 권한 필요)", tags=["인증 API"])
async def change_user_password(
    user_id: int,  # 변경할 유저의 ID를 입력 받습니다.
    password_data: PasswordChangeRequest,
    current_admin: User = Depends(get_current_admin),  # 어드민 권한으로 접근
    db: Session = Depends(get_db)
):
    """
    어드민 토큰을 사용하여 일반 사용자의 비밀번호를 변경합니다.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="해당 사용자를 찾을 수 없습니다.")
    
    if not verify_password(password_data.old_password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="기존 비밀번호가 올바르지 않습니다.")

    # 새 비밀번호 저장
    hashed_new_password = hash_password(password_data.new_password)
    user.password = hashed_new_password
    db.commit()
    return {"message": "사용자 비밀번호가 성공적으로 변경되었습니다."}

# 관리자 비밀번호 변경 엔드포인트
@router.put("/admin/change-password", summary="관리자 비밀번호 변경", tags=["인증 API"])
async def change_admin_password(
    password_data: PasswordChangeRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if not verify_password(password_data.old_password, current_admin.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="기존 비밀번호가 올바르지 않습니다.")

    # 새 비밀번호 저장
    hashed_new_password = hash_password(password_data.new_password)
    current_admin.password = hashed_new_password
    db.commit()
    return {"message": "관리자 비밀번호가 성공적으로 변경되었습니다."}
