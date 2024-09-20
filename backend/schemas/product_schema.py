from pydantic import BaseModel, Field, ConfigDict
from typing import List
from .attribute_schema import AttributeResponse

# 상품 스키마
class ProductSchema(BaseModel):
    id: int = Field(..., title="Product Category ID")
    name: str = Field(..., title="Product Category Name")
    category_id: str = Field(..., title="Category ID")
    price: float = Field(..., title="Product Price")

    model_config = ConfigDict(from_attributes=True)

# 상품 기본 스키마
class ProductBase(BaseModel):
    name: str = Field(..., title="Product Name")
    price: float = Field(..., title="Product Price")

    model_config = ConfigDict(from_attributes=True)

# 상품 생성 스키마
class ProductCreate(ProductBase):
    attributes: List[str] = Field(..., title="Attribute IDs")  # 속성 ID 리스트로 처리

    model_config = ConfigDict(from_attributes=True)

# 상품 응답 스키마
class ProductResponse(ProductBase):
    id: int = Field(..., title="Product ID")
    attributes: List[AttributeResponse] = Field(..., title="Product Attributes")  # 속성 응답 리스트

    model_config = ConfigDict(from_attributes=True)
