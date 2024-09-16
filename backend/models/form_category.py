from sqlalchemy import Column, String, ForeignKey, Integer
from database import Base
from sqlalchemy.orm import relationship

class FormCategory(Base):
    __tablename__ = 'form_category'

    id = Column(Integer, primary_key=True, autoincrement=True) 
    form_id = Column(Integer, ForeignKey('form.id'), nullable=False)
    category_id = Column(Integer, ForeignKey('category.id'), nullable=False)

    form = relationship('Form', back_populates='form_categories')
    category = relationship('Category', back_populates='form_categories')