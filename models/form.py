from sqlalchemy import Column, String, Integer, TIMESTAMP, func
from database import Base
from sqlalchemy.orm import relationship

# Form Model
class Form(Base):
    __tablename__ = 'form'

    id = Column(Integer, primary_key=True, autoincrement=True) 
    name = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP, default=func.now(), nullable=False)

    # Relationships
    events = relationship('Event', back_populates='form')
    form_categories = relationship('FormCategory', back_populates="form")
    form_repairs = relationship("FormRepair", back_populates="form")