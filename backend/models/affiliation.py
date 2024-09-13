from sqlalchemy import Column, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Affiliation(Base):
    __tablename__ = 'affiliation'

    id = Column(String(255), primary_key=True)
    name = Column(String(255), nullable=False)
