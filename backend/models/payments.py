from sqlalchemy import Column, String, ForeignKey, DECIMAL, TIMESTAMP
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Payments(Base):
    __tablename__ = 'Payments'

    id = Column(String(255), primary_key=True)
    order_id = Column(String(255), ForeignKey('order.id'), nullable=False)
    payment_date = Column(TIMESTAMP, nullable=False)
    cash_amount = Column(DECIMAL(10, 2), nullable=False)
    cash_currency = Column(String(20), nullable=False)  # ENUM 처리 필요
    card_amount = Column(DECIMAL(10, 2), nullable=False)
    card_currency = Column(String(20), nullable=False)  # ENUM 처리 필요
    trade_in_amount = Column(DECIMAL(10, 2), nullable=False)
    trade_in_currency = Column(String(20), nullable=False)  # ENUM 처리 필요
    notes = Column(String, nullable=True)  # TEXT type
    payment_method = Column(String(20), nullable=False)  # ENUM 처리 필요
