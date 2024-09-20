from sqlalchemy import Column, String, Integer
from database import Base
from sqlalchemy.orm import relationship

class Affiliation(Base):
    __tablename__ = 'affiliation'

    id = Column(Integer, primary_key=True, autoincrement=True) 
    name = Column(String(255), nullable=False)

    orders = relationship('Order', back_populates='affiliation')