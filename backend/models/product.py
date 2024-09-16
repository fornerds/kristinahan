from sqlalchemy import Column, String, DECIMAL, ForeignKey, Integer
from database import Base
from sqlalchemy.orm import relationship


class Product(Base):
    __tablename__ = 'product'

    id = Column(Integer, primary_key=True, autoincrement=True) 
    name = Column(String(255), nullable=False)
    category_id = Column(Integer, ForeignKey('category.id'), nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)

    category = relationship('Category', back_populates='products')
    product_attributes = relationship('ProductAttributes', back_populates='product')
    attributes = relationship('Attributes', secondary='product_attributes', back_populates='products', overlaps="product_attributes")
