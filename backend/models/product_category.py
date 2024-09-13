from sqlalchemy import Column, String, DECIMAL, ForeignKey
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class ProductCategory(Base):
    __tablename__ = 'product_category'

    id = Column(String(255), primary_key=True)
    name = Column(String(255), nullable=False)
    category_id = Column(String(255), ForeignKey('category.id'), nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)
