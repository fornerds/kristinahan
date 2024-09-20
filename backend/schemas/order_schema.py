from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import List, Optional
from models.order import OrderStatus  # 모델에서 OrderStatus 열거형(Enum)을 가져옴

# 기본 주문서 스키마
class OrderBase(BaseModel):
    event_id: int = Field(..., title="이벤트 ID")
    author_id: int = Field(..., title="작성자 ID")
    affiliation_id: int = Field(..., title="소속 ID")
    orderName: str = Field(..., title="주문자 이름")
    contact: str = Field(..., title="연락처 정보")
    address: str = Field(..., title="배송 주소")
    collectionMethod: str = Field(..., title="수령 방법")
    notes: Optional[str] = Field(None, title="추가 메모")
    totalPrice: float = Field(..., title="총 가격")
    advancePayment: float = Field(..., title="선불 금액")
    balancePayment: float = Field(..., title="잔금 금액")
    isTemporary: bool = Field(False, title="임시 주문 여부")

    model_config = ConfigDict(from_attributes=True) 

# 주문서 생성 시 사용하는 스키마
class OrderCreate(OrderBase):
    status: OrderStatus  # 모델의 OrderStatus 열거형을 사용
    payments: List["PaymentInfo"]
    alteration_details: Optional["AlterationDetailsCreate"]

# 주문서 업데이트 시 사용하는 스키마
class OrderUpdate(OrderBase):
    status: OrderStatus
    payments: Optional[List["PaymentInfo"]]
    alteration_details: Optional["AlterationDetailsCreate"]

# 결제 정보 스키마
class PaymentInfo(BaseModel):
    payment_date: datetime
    cashAmount: float
    cashCurrency: str
    cardAmount: float
    cardCurrency: str
    tradeInAmount: float
    tradeInCurrency: str
    paymentMethod: str
    notes: Optional[str]

    model_config = ConfigDict(from_attributes=True)

# 수선 정보 스키마
class AlterationDetailsCreate(BaseModel):
    jacketSleeve: int
    jacketLength: int
    jacketForm: int
    pantsCircumference: int
    pantsLength: int
    shirtNeck: int
    shirtSleeve: int
    dressBackForm: int
    dressLength: int
    notes: Optional[str]

    model_config = ConfigDict(from_attributes=True)

# 상품 속성 스키마
class ProductAttributeInfo(BaseModel):
    attribute_value: str

    model_config = ConfigDict(from_attributes=True)

# 주문서 내 상품 정보 스키마
class ProductInfo(BaseModel):
    name: str
    price: float
    quantity: int
    attributes: List[ProductAttributeInfo]

    model_config = ConfigDict(from_attributes=True)

# 주문서 상세 응답 스키마
class OrderDetailResponse(OrderBase):
    id: int
    event_name: Optional[str]
    form_name: Optional[str]
    products: List[ProductInfo]
    payments: List[PaymentInfo]
    created_at: datetime
    updated_at: datetime
    status: OrderStatus  # 모델의 OrderStatus 열거형 사용

    model_config = ConfigDict(from_attributes=True)

# 주문서 리스트 응답 스키마
class OrderListResponse(BaseModel):
    orders: List[OrderDetailResponse]
    total: int

    model_config = ConfigDict(from_attributes=True)

# 주문서 기본 응답 스키마 (리스트 조회에 사용)
class OrderResponse(OrderBase):
    id: int
    created_at: datetime
    updated_at: datetime
    status: OrderStatus  # 모델의 OrderStatus 열거형 사용

    model_config = ConfigDict(from_attributes=True)

# 주문 상태 업데이트 스키마
class OrderStatusUpdate(BaseModel):
    id: int = Field(..., title="주문서 ID")
    status: OrderStatus = Field(..., title="주문 상태")
    updated_at: datetime = Field(..., title="업데이트 일자")

    model_config = ConfigDict(from_attributes=True)
