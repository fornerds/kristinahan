from sqlalchemy import Column, String, Integer
from database import Base
from sqlalchemy.orm import relationship


class Author(Base):
    __tablename__ = 'author'

    id = Column(Integer, primary_key=True, autoincrement=True) 
    name = Column(String(255), nullable=False)

    authored_orders = relationship('Order', back_populates='author')