from sqlalchemy import Column, String, ForeignKey, DECIMAL, TIMESTAMP, Enum as SQLAlchemyEnum, Integer
from database import Base
from sqlalchemy.orm import relationship
from enum import Enum

class CurrencyType(str, Enum):
    KRW = 'KRW'
    JPY = 'JPY'
    USD = 'USD'

class TradeInCurrencyType(str, Enum):
    K10 = '10K'
    K14 = '14K'
    K18 = '18K'
    K24 = '24K'

class PaymentMethodType(str, Enum):
    ADVANCE = 'advance'
    BALANCE = 'balance'

class Payments(Base):
    __tablename__ = 'payments'

    id = Column(Integer, primary_key=True, autoincrement=True) 
    order_id = Column(Integer, ForeignKey('order.id'), nullable=False)
    payment_date = Column(TIMESTAMP, nullable=False)
    cashAmount = Column(DECIMAL(10, 2), nullable=False)
    cashCurrency = Column('cashCurrency', SQLAlchemyEnum(CurrencyType), nullable=False)
    cardAmount = Column(DECIMAL(10, 2), nullable=False)
    cardCurrency = Column('cardCurrency', SQLAlchemyEnum(CurrencyType), nullable=False)
    tradeInAmount = Column(DECIMAL(10, 2), nullable=False)
    tradeInCurrency = Column('tradeInCurrency', SQLAlchemyEnum(TradeInCurrencyType), nullable=False)
    notes = Column(String, nullable=True)  # TEXT type
    paymentMethod = Column('paymentMethod', SQLAlchemyEnum(PaymentMethodType), nullable=False)

    # Relationship
    order = relationship('Order', back_populates='payments')
