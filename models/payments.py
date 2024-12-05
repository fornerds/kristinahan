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
    payer =  Column(String(255), nullable=True)
    payment_date = Column(TIMESTAMP, nullable=True)
    cashAmount = Column(DECIMAL(10, 2), nullable=True)
    cashCurrency = Column('cashCurrency', SQLAlchemyEnum(CurrencyType), nullable=True)
    cashConversion = Column(DECIMAL(10, 2), nullable=True)
    cardAmount = Column(DECIMAL(10, 2), nullable=True)
    cardCurrency = Column('cardCurrency', SQLAlchemyEnum(CurrencyType), nullable=True)
    cardConversion = Column(DECIMAL(10, 2), nullable=True)
    tradeInAmount = Column(DECIMAL(10, 2), nullable=True)
    tradeInCurrency = Column('tradeInCurrency', SQLAlchemyEnum(TradeInCurrencyType), nullable=True)
    tradeInConversion = Column(DECIMAL(10, 2), nullable=True)
    notes = Column(String, nullable=True)  # TEXT type
    paymentMethod = Column('paymentMethod', SQLAlchemyEnum(PaymentMethodType), nullable=True)

    # Relationship
    orders = relationship('Order', back_populates='payments')
