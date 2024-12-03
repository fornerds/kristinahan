from pydantic import BaseModel, Field, ConfigDict
from enum import Enum
from typing import Optional

# 사용자 역할 정의
class UserRole(str, Enum):
    user = 'user'
    admin = 'admin'

# 사용자 응답 스키마 (비밀번호 제외)
class UserResponse(BaseModel):
    id: int = Field(..., title="User ID")
    role: UserRole = Field(..., title="User Role")


# JWT 토큰 응답 스키마
class TokenResponse(BaseModel):
    access_token: str = Field(..., title="JWT Access Token")
    token_type: str = Field(..., title="Token Type")

# 비밀번호 변경 요청 스키마
class PasswordChangeRequest(BaseModel):
    old_password: str = Field(..., title="Old Password")
    new_password: str = Field(..., title="New Password")

