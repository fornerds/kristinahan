from sqlalchemy import Column, String, ForeignKey, Integer
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class AlterationDetails(Base):
    __tablename__ = 'AlterationDetails'

    id = Column(String(255), primary_key=True)
    order_id = Column(String(255), ForeignKey('order.id'), nullable=False)
    jacket_sleeve = Column(Integer, nullable=False)
    jacket_length = Column(Integer, nullable=False)
    jacket_form = Column(Integer, nullable=False)
    pants_circumference = Column(Integer, nullable=False)
    pants_length = Column(Integer, nullable=False)
    shirt_neck = Column(Integer, nullable=False)
    shirt_sleeve = Column(Integer, nullable=False)
    dress_back_form = Column(Integer, nullable=False)
    dress_length = Column(Integer, nullable=False)
    notes = Column(String, nullable=True)  # TEXT type
