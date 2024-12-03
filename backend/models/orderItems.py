from sqlalchemy import Column, ForeignKey, Integer, DECIMAL
from database import Base
from sqlalchemy.orm import relationship

class OrderItems(Base):
    __tablename__ = 'orderItems'

    id = Column(Integer, primary_key=True, autoincrement=True) 
    order_id = Column(Integer, ForeignKey('order.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('product.id'), nullable=False)
    attribute_id = Column(Integer, ForeignKey('attributes.id'), nullable=True)
    quantity = Column(Integer, nullable=True)
    price = Column(DECIMAL(10, 2), nullable=True)

    orders = relationship('Order', back_populates='order_items')
    product = relationship('Product', back_populates='order_items')
    attribute = relationship('Attributes')