from sqlalchemy import Column, String, ForeignKey, Enum as SQLAlchemyEnum, Integer, Boolean
from database import Base
from sqlalchemy.orm import relationship
from enum import Enum

# Enum definitions
class UnitType(str, Enum):
    CM = 'cm'
    INCH = 'inch'

# Form Model
class FormRepair(Base):
    __tablename__ = 'form_repair'

    id = Column(Integer, primary_key=True, autoincrement=True) 
    form_id = Column(Integer, ForeignKey('form.id'), nullable=False)
    information = Column(String(255), nullable=True)
    unit = Column(SQLAlchemyEnum(UnitType), nullable=True)
    isAlterable = Column(Boolean, nullable=True)
    standards = Column(String(255), nullable=True)
    indexNumber = Column(Integer, nullable=True)

    # Relationships
    alteration_details = relationship("AlterationDetails", back_populates="form_repair")

    form = relationship('Form', foreign_keys=[form_id], back_populates="form_repairs")


