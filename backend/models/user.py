from sqlalchemy import Column, String, Enum
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = 'user'
    
    id = Column(String(255), primary_key=True)
    password = Column(String(255))
    role = Column(Enum('user', 'admin'))