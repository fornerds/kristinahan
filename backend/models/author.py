from sqlalchemy import Column, String, Integer
from database import Base
from sqlalchemy.orm import relationship
from models.order import Order


class Author(Base):
    __tablename__ = 'author'

    id = Column(Integer, primary_key=True, autoincrement=True) 
    name = Column(String(255), nullable=True)

    authored_orders = relationship("Order", foreign_keys=[Order.author_id], back_populates="author")
    modified_orders = relationship("Order", foreign_keys=[Order.modifier_id], back_populates="modifier")