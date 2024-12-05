from sqlalchemy import TIMESTAMP, Column, Float, Date, Integer
from database import Base

class Rate(Base):
    __tablename__ = "rate"
    
    id = Column(Integer, primary_key=True, autoincrement=True) 

    gold_bas_dt = Column(Date, nullable=True)
    gold_10k = Column(Float, nullable=True)
    gold_14k = Column(Float, nullable=True)
    gold_18k = Column(Float, nullable=True)
    gold_24k = Column(Float, nullable=True)
    
    exchange_bas_dt = Column(Date, nullable=True)
    usd = Column(Float, nullable=True)
    jpy = Column(Float, nullable=True)
    krw = Column(Float, nullable=True)
    
    search_dt = Column(TIMESTAMP, nullable=True)

    def __repr__(self):
        return f"<Rate(gold_bas_dt={self.gold_bas_dt}, exchange_bas_dt={self.exchange_bas_dt})>"
