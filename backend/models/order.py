from sqlalchemy import Column, String, ForeignKey, TIMESTAMP, Boolean, Enum as SQLAlchemyEnum, DECIMAL, Integer
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
    author_id = Column(Integer, ForeignKey('author.id'), nullable=False)
    affiliation_id = Column(Integer, ForeignKey('affiliation.id'), nullable=False)
    created_at = Column(TIMESTAMP, nullable=False)
    updated_at = Column(TIMESTAMP, nullable=False)
    status = Column(SQLAlchemyEnum(OrderStatus), nullable=False)
    orderName = Column(String(255), nullable=False)
    contact = Column(String(255), nullable=False)
    address = Column(String(255), nullable=False)
    collectionMethod = Column(String(20), nullable=False)
    notes = Column(String, nullable=True)
    totalPrice = Column(DECIMAL(10, 2), nullable=False)
    advancePayment = Column(DECIMAL(10, 2), nullable=False)
    balancePayment = Column(DECIMAL(10, 2), nullable=False)
    isTemporary = Column(Boolean, nullable=False, default=False) 

    event = relationship('Event', back_populates='orders')
    order_items = relationship('OrderItems', back_populates='order')
    payments = relationship('Payments', back_populates='order')

    author = relationship("Author", back_populates="authored_orders")
    affiliation = relationship("Affiliation", back_populates="orders")