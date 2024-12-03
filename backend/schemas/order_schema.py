from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from schemas.alteration_details_schema import AlterationDetailsInfo
from schemas.category_schema import AttributeResponse
from schemas.form_schema import FormResponse

# 결제 정보 스키마
class PaymentInfo(BaseModel):
    payer: Optional[str] = None
    payment_date: Optional[datetime] = None
    cashAmount: Optional[float] = None
    cashCurrency: Optional[str] = None
    cashConversion: Optional[float] = None
    cardAmount: Optional[float] = None
    cardCurrency: Optional[str] = None
    cardConversion: Optional[float] = None
    tradeInAmount: Optional[float] = None
    tradeInCurrency: Optional[str] = None
    tradeInConversion: Optional[float] = None
    paymentMethod: Optional[str] = None
    notes: Optional[str] = None

# 주문 항목 (OrderItems) 스키마
class OrderItemCreate(BaseModel):
    product_id: Optional[int] = None
    attributes_id: Optional[int] = None
    quantity: Optional[int] = None
    price: Optional[float] = None

class ProductResponse(BaseModel):
    id: Optional[int]
    name: Optional[str] = None
    price: Optional[float] = None

# 주문서 상세 조회 응답 스키마
class OrderItemResponse(BaseModel):
    product: Optional[ProductResponse] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    attributes: Optional[List[AttributeResponse]] = []

# 주문서 필터 응답 스키마
class OrderFilterResponse(BaseModel):
    id: Optional[int] = None
    event_id: Optional[int] = None
    author_id: Optional[int] = None
    modifier_id: Optional[int] = None
    affiliation_id: Optional[int] = None
    event_name: Optional[str] = None
    form_name: Optional[str] = None
    orderItems: Optional[List[OrderItemResponse]] = []
    payments: Optional[List[PaymentInfo]] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    status: Optional[str] = None
    groomName: Optional[str] = None
    brideName: Optional[str] = None
    contact: Optional[str] = None
    address: Optional[str] = None
    collectionMethod: Optional[str] = None
    notes: Optional[str] = None
    alter_notes: Optional[str] = None
    totalPrice: Optional[float] = None
    advancePayment: Optional[float] = None
    balancePayment: Optional[float] = None

# 주문서 목록 응답 스키마
class OrderListResponse(BaseModel):
    orders: Optional[List[OrderFilterResponse]] = []
    total: Optional[int] = None

# 주문서 상세 조회 응답 스키마
class OrderDetailResponse(BaseModel):
    id: Optional[int] = None
    event_id: Optional[int] = None
    author_id: Optional[int] = None
    modifier_id: Optional[int] = None
    affiliation_id: Optional[int] = None
    event_name: Optional[str] = None
    form: Optional[FormResponse] = None
    orderItems: Optional[List[OrderItemResponse]] = []
    payments: Optional[List[PaymentInfo]] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    status: Optional[str] = None
    groomName: Optional[str] = None
    brideName: Optional[str] = None
    contact: Optional[str] = None
    address: Optional[str] = None
    collectionMethod: Optional[str] = None
    notes: Optional[str] = None
    alter_notes: Optional[str] = None
    totalPrice: Optional[float] = None
    advancePayment: Optional[float] = None
    balancePayment: Optional[float] = None
    alteration_details: Optional[List[AlterationDetailsInfo]] = []

# 주문서 생성 요청 스키마
class OrderCreate(BaseModel):
    event_id: Optional[int]
    author_id: Optional[int] = None
    modifier_id: Optional[int] = None
    affiliation_id: Optional[int] = None
    status: Optional[str] = None
    groomName: Optional[str] = None
    brideName: Optional[str] = None
    contact: Optional[str] = None
    address: Optional[str] = None
    collectionMethod: Optional[str] = None
    notes: Optional[str] = None
    alter_notes: Optional[str] = None
    totalPrice: Optional[float] = None
    advancePayment: Optional[float] = None
    balancePayment: Optional[float] = None
    payments: Optional[List[PaymentInfo]] = []
    alteration_details: Optional[List[AlterationDetailsInfo]] = []  # 다중 수선 정보 리스트
    orderItems: Optional[List[OrderItemCreate]] = []

# 주문 상태 업데이트 스키마
class OrderStatusUpdate(BaseModel):
    id: Optional[int]
    status: Optional[str] = None
    updated_at: Optional[datetime]
