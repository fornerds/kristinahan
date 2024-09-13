from sqlalchemy import Column, String, ForeignKey, TIMESTAMP
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Enum

Base = declarative_base()

class OrderStatus(str, Enum):
    Consultation = 'Consultation'
    Order = 'Order'
    Repair = 'Repair'
    Repair_in_stock = 'Repair in stock'
    In_delivery = 'In delivery'
    Delivery_completed = 'Delivery completed'
    Receipt_completed = 'Receipt completed'

class Order(Base):
    __tablename__ = 'order'

    id = Column(String(255), primary_key=True)
    event_id = Column(String(255), ForeignKey('event.id'), nullable=False)
    author_id = Column(String(255), ForeignKey('author.id'), nullable=False)
    created_at = Column(TIMESTAMP, nullable=False)
    updated_at = Column(TIMESTAMP, nullable=False)
    status = Column(Enum(OrderStatus), nullable=False)
    orderer_name = Column(String(255), nullable=False)
    contact = Column(String(255), nullable=False)
    affiliation_id = Column(String(255), ForeignKey('affiliation.id'), nullable=False)
    address = Column(String(255), nullable=False)
    collection_method = Column(String(20), nullable=False)
    notes = Column(String, nullable=True)  # TEXT type
    total_price = Column(DECIMAL(10, 2), nullable=False)
    advance_payment = Column(DECIMAL(10, 2), nullable=False)
    balance_payment = Column(DECIMAL(10, 2), nullable=False)
