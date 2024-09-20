from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
from typing import Optional


class Currency(str, Enum):
    KRW = 'KRW'
    JPY = 'JPY'
    USD = 'USD'


class PaymentsSchema(BaseModel):
    id: int = Field(..., title="Payment ID")
    order_id: int = Field(..., title="Order ID")
    payment_date: datetime = Field(..., title="Payment Date")
    cashAmount: float = Field(..., title="Cash Amount")
    cashCurrency: Currency = Field(..., title="Cash Currency")
    cardAmount: float = Field(..., title="Card Amount")
    cardCurrency: Currency = Field(..., title="Card Currency")
    tradeInAmount: float = Field(..., title="Trade-in Amount")
    tradeInCurrency: str = Field(..., title="Trade-in Currency")
    notes: Optional[str] = Field(None, title="Payment Notes")
    paymentMethod: str = Field(..., title="Payment Method")
