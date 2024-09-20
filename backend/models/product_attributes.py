from sqlalchemy import Column, String, ForeignKey, Integer
from database import Base
from sqlalchemy.orm import relationship


class ProductAttributes(Base):
    __tablename__ = 'product_attributes'

    id = Column(Integer, primary_key=True, autoincrement=True) 
    product_id = Column(Integer, ForeignKey('product.id'), nullable=False)
    attribute_id = Column(Integer, ForeignKey('attributes.id'), nullable=False)

    product = relationship('Product', back_populates='product_attributes', overlaps="attributes,products")
    attribute = relationship('Attributes', back_populates='product_attributes', overlaps="attributes,products")