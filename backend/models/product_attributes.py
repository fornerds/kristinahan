from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class ProductAttributes(Base):
    __tablename__ = 'product_attributes'

    id = Column(String(255), primary_key=True)
    product_id = Column(String(255), ForeignKey('product.id'), nullable=False)
    attribute_id = Column(String(255), ForeignKey('attributes.id'), nullable=False)
