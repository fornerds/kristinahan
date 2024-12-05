from sqlalchemy import Column, String, Enum as SQLAlchemyEnum, Integer
from database import Base
from enum import Enum

class UserRole(str, Enum):
    User = 'user'
    Admin = 'admin'


class User(Base):
    __tablename__ = 'user'

    id = Column(Integer, primary_key=True) 
    password = Column(String(255), nullable=False)
    role = Column(SQLAlchemyEnum(UserRole), nullable=False)