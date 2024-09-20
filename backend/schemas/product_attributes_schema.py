from pydantic import BaseModel, Field, ConfigDict
from typing import List
from .attribute_schema import AttributeResponse

class ProductAttributesSchema(BaseModel):
    id: int = Field(..., title="Product Attributes ID")
    product_id: str = Field(..., title="Product ID")
    attribute_id: str = Field(..., title="Attribute ID")

    model_config = ConfigDict(from_attributes=True)

# 상품 기본 스키마
class ProductBase(BaseModel):
    name: str = Field(..., title="Product Name")
    price: float = Field(..., title="Product Price")

    model_config = ConfigDict(from_attributes=True)

# 상품 생성 스키마
class ProductCreate(ProductBase):
    attributes: List[str] = Field(..., title="Attribute IDs")

# 상품 응답 스키마
class ProductResponse(BaseModel):
    id: int = Field(..., title="Product ID")
    name: str = Field(..., title="Product Name")
    price: float = Field(..., title="Product Price")
    attributes: List[AttributeResponse] = Field(..., title="Product Attributes")

    model_config = ConfigDict(from_attributes=True)
