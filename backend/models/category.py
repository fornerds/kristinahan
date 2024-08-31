from sqlalchemy import Column, String, TIMESTAMP
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Category(Base):
    __tablename__ = 'category'
    
    id = Column(String(255), primary_key=True)
    name = Column(String(255))
    created_at = Column(TIMESTAMP)
    