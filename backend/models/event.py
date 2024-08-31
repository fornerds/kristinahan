from sqlalchemy import Column, String, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from . import Base

class Event(Base):
    __tablename__ = 'event'
    
    id = Column(String(255), primary_key=True)
    name = Column(String(255))
    form_id = Column(String(255), ForeignKey('form.id'))
    start_date = Column(Date)
    end_date = Column(Date)
    inProgress = Column(Boolean)
    
    form = relationship("Form", back_populates="events")