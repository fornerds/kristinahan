from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional

# 사용자 역할 정의
class UserRole(str, Enum):
    user = 'user'
    admin = 'admin'

# 사용자 기본 스키마
class UserBase(BaseModel):
    id: int = Field(..., title="User ID")
    role: UserRole = Field(..., title="User Role")

    class Config:
        orm_mode = True

# 사용자 등록 스키마
class UserCreate(BaseModel):
    id: int = Field(..., title="User ID")
    password: str = Field(..., title="User Password")
    role: UserRole = Field(..., title="User Role")

    class Config:
        orm_mode = True

# 사용자 업데이트 스키마
class UserUpdate(BaseModel):
    password: Optional[str] = Field(None, title="New Password")
    role: Optional[UserRole] = Field(None, title="User Role")

    class Config:
        orm_mode = True

# 사용자 응답 스키마 (비밀번호 제외)
class UserResponse(UserBase):
    pass

# JWT 토큰 응답 스키마
class TokenResponse(BaseModel):
    access_token: str = Field(..., title="JWT Access Token")
    token_type: str = Field(..., title="Token Type")

# 비밀번호 변경 요청 스키마
class PasswordChangeRequest(BaseModel):
    old_password: str = Field(..., title="Old Password")
    new_password: str = Field(..., title="New Password")

    class Config:
        orm_mode = True
