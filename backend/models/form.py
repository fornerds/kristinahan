from sqlalchemy import Column, String, Enum, TIMESTAMP
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Form(Base):
    __tablename__ = 'form'
    
    id = Column(String(255), primary_key=True)
    name = Column(String(255))
    jacketSleeve = Column(Enum('cm', 'inch'))
    jacketLength = Column(Enum('cm', 'inch'))
    jacketForm = Column(Enum('cm', 'inch'))
    pantsCircumference = Column(Enum('cm', 'inch'))
    pantsLength = Column(Enum('cm', 'inch'))
    shirtNeck = Column(Enum('cm', 'inch'))
    shirtSleeve = Column(Enum('cm', 'inch'))
    dressBackForm = Column(Enum('cm', 'inch'))
    dressLength = Column(Enum('cm', 'inch'))
    created_at = Column(TIMESTAMP)