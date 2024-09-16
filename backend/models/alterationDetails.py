from sqlalchemy import Column, String, ForeignKey, Integer
from database import Base
from sqlalchemy.orm import relationship


class AlterationDetails(Base):
    __tablename__ = 'alterationDetails'

    id = Column(Integer, primary_key=True, autoincrement=True) 
    order_id = Column(Integer, ForeignKey('order.id'), nullable=False)
    jacketSleeve = Column(Integer, nullable=False)
    jacketLength = Column(Integer, nullable=False)
    jacketForm = Column(Integer, nullable=False)
    pantsCircumference = Column(Integer, nullable=False)
    pantsLength = Column(Integer, nullable=False)
    shirtNeck = Column(Integer, nullable=False)
    shirtSleeve = Column(Integer, nullable=False)
    dressBackForm = Column(Integer, nullable=False)
    dressLength = Column(Integer, nullable=False)
    notes = Column(String, nullable=True)
