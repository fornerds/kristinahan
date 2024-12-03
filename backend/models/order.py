from sqlalchemy import Column, String, ForeignKey, TIMESTAMP, Boolean, Enum as SQLAlchemyEnum, DECIMAL, Integer, func
from enum import Enum
from database import Base
from sqlalchemy.orm import relationship

class OrderStatus(str, Enum):
    Order_Completed = 'Order Completed'
    Packaging_Completed = 'Packaging Completed'
    Repair_Received = 'Repair Received'
    Repair_Completed = 'Repair Completed'
    In_delivery = 'In delivery'
    Delivery_completed = 'Delivery completed'
    Receipt_completed = 'Receipt completed'
    Accommodation = 'Accommodation'

class Order(Base):
    __tablename__ = 'order'

    id = Column(Integer, primary_key=True, autoincrement=True) 
    event_id = Column(Integer, ForeignKey('event.id'), nullable=False)
    author_id = Column(Integer, ForeignKey('author.id'), nullable=True)
    modifier_id = Column(Integer, ForeignKey('author.id'), nullable=True)
    affiliation_id = Column(Integer, ForeignKey('affiliation.id'), nullable=True)
    created_at = Column(TIMESTAMP, default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)
    status = Column(SQLAlchemyEnum(OrderStatus), nullable=True)
    groomName = Column(String(255), nullable=True)
    brideName = Column(String(255), nullable=True)
    contact = Column(String(255), nullable=True)
    address = Column(String(255), nullable=True)
    collectionMethod = Column(String(20), nullable=True)
    notes = Column(String, nullable=True)
    alter_notes = Column(String, nullable=True)
    totalPrice = Column(DECIMAL(10, 2), nullable=True)
    advancePayment = Column(DECIMAL(10, 2), nullable=True)
    balancePayment = Column(DECIMAL(10, 2), nullable=True)
    isTemporary = Column(Boolean, nullable=True, default=False) 

    event = relationship('Event', back_populates='orders')
    order_items = relationship('OrderItems', back_populates='orders')
    payments = relationship('Payments', back_populates='orders')
    alteration_details = relationship('AlterationDetails', back_populates='orders')

    author = relationship("Author", foreign_keys=[author_id], back_populates="authored_orders")
    modifier = relationship("Author", foreign_keys=[modifier_id], back_populates="modified_orders")
    affiliation = relationship("Affiliation", foreign_keys=[affiliation_id], back_populates="orders")