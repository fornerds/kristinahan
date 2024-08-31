from pydantic import BaseModel

class UserBase(BaseModel):
    id: str
    password: str
    role: str

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    class Config:
        orm_mode = True