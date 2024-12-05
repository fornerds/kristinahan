from sqlalchemy import Column, ForeignKey, Integer, Float
from database import Base
from sqlalchemy.orm import relationship

class AlterationDetails(Base):
    __tablename__ = 'alterationDetails'

    id = Column(Integer, primary_key=True, autoincrement=True) 
    order_id = Column(Integer, ForeignKey('order.id'), nullable=False)
    form_repair_id = Column(Integer, ForeignKey('form_repair.id'), nullable=False)
    figure = Column(Float, nullable=True)
    alterationFigure = Column(Float, nullable=True)

    orders = relationship('Order', back_populates='alteration_details')
    form_repair = relationship("FormRepair", back_populates="alteration_details")