from sqlalchemy import Column, String, ForeignKey, Integer, DECIMAL
from database import Base
from sqlalchemy.orm import relationship

class OrderItems(Base):
    __tablename__ = 'orderItems'

    id = Column(Integer, primary_key=True, autoincrement=True) 
    order_id = Column(Integer, ForeignKey('order.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('product.id'), nullable=False)
    attribute_id = Column(Integer, ForeignKey('attributes.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)

    order = relationship('Order', back_populates='order_items')
    product = relationship('Product')
    attribute = relationship('Attributes')