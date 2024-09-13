from sqlalchemy import Column, String, ForeignKey, Integer, DECIMAL
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class OrderItems(Base):
    __tablename__ = 'OrderItems'

    id = Column(String(255), primary_key=True)
    order_id = Column(String(255), ForeignKey('order.id'), nullable=False)
    product_id = Column(String(255), ForeignKey('product.id'), nullable=False)
    attribute_id = Column(String(255), ForeignKey('attributes.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)
