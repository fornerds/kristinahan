from sqlalchemy import Column, String, Integer
from database import Base
from sqlalchemy.orm import relationship


class Attributes(Base):
    __tablename__ = 'attributes'

    id = Column(Integer, primary_key=True, autoincrement=True) 
    value = Column(String(255), nullable=False)

    product_attributes = relationship('ProductAttributes', back_populates='attribute')
    products = relationship('Product', secondary='product_attributes', back_populates='attributes', overlaps="product_attributes")