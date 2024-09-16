from pydantic import BaseModel, Field
from typing import List
from .attribute_schema import AttributeResponse

class ProductSchema(BaseModel):
    id: int = Field(..., title="Product Category ID")
    name: str = Field(..., title="Product Category Name")
    category_id: str = Field(..., title="Category ID")
    price: float = Field(..., title="Product Price")

# 상품 기본 스키마
class ProductBase(BaseModel):
    name: str
    price: float

# 상품 생성 스키마
class ProductCreate(ProductBase):
    attributes: List[str]  # 속성 ID 리스트로 처리

# 상품 응답 스키마
class ProductResponse(ProductBase):
    id: int = Field(..., title="Product ID")
    attributes: List[AttributeResponse]  # 속성 응답 리스트

    class Config:
        orm_mode = True