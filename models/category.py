from sqlalchemy import Column, String, TIMESTAMP, Integer, func
from database import Base
from sqlalchemy.orm import relationship


class Category(Base):
    __tablename__ = 'category'

    id = Column(Integer, primary_key=True, autoincrement=True) 
    name = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP, default=func.now(), nullable=False)
    
    form_categories = relationship('FormCategory', back_populates='category')
    products = relationship('Product', back_populates="category")