from sqlalchemy import Column, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Author(Base):
    __tablename__ = 'author'

    id = Column(String(255), primary_key=True)
    name = Column(String(255), nullable=False)
