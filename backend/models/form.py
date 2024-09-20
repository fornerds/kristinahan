from sqlalchemy import Column, String, TIMESTAMP, Enum as SQLAlchemyEnum, Integer
from database import Base
from sqlalchemy.orm import relationship
from enum import Enum

# Enum definitions
class UnitType(str, Enum):
    CM = 'cm'
    INCH = 'inch'

# Form Model
class Form(Base):
    __tablename__ = 'form'

    id = Column(Integer, primary_key=True, autoincrement=True) 
    name = Column(String(255), nullable=False)

    # Using Python Enum with SQLAlchemyEnum and explicitly defining the column name
    jacketSleeve = Column('jacketSleeve', SQLAlchemyEnum(UnitType), nullable=False)
    jacketLength = Column('jacketLength', SQLAlchemyEnum(UnitType), nullable=False)
    jacketForm = Column('jacketForm', SQLAlchemyEnum(UnitType), nullable=False)
    pantsCircumference = Column('pantsCircumference', SQLAlchemyEnum(UnitType), nullable=False)
    pantsLength = Column('pantsLength', SQLAlchemyEnum(UnitType), nullable=False)
    shirtNeck = Column('shirtNeck', SQLAlchemyEnum(UnitType), nullable=False)
    shirtSleeve = Column('shirtSleeve', SQLAlchemyEnum(UnitType), nullable=False)
    dressBackForm = Column('dressBackForm', SQLAlchemyEnum(UnitType), nullable=False)
    dressLength = Column('dressLength', SQLAlchemyEnum(UnitType), nullable=False)
    created_at = Column(TIMESTAMP, nullable=False)

    # Relationships
    events = relationship('Event', back_populates='form')
    form_categories = relationship('FormCategory', back_populates="form")