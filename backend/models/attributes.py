from sqlalchemy import Column, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Attributes(Base):
    __tablename__ = 'attributes'

    id = Column(String(255), primary_key=True)
    product_id = Column(String(255), nullable=False)  # Foreign key not defined here
    value = Column(String(255), nullable=False)
