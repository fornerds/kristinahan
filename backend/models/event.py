from sqlalchemy import Column, String, ForeignKey, Date, Boolean, Integer
from database import Base
from sqlalchemy.orm import relationship

class Event(Base):
    __tablename__ = 'event'

    id = Column(Integer, primary_key=True, autoincrement=True) 
    name = Column(String(255), nullable=False)
    form_id = Column(Integer, ForeignKey('form.id'), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    inProgress = Column(Boolean, nullable=False)

    form = relationship('Form', back_populates='events')
    orders = relationship('Order', back_populates='event')