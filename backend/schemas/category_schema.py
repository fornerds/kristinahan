from pydantic import BaseModel, Field
from typing import List
from .product_schema import ProductResponse
from datetime import datetime


class CategorySchema(BaseModel):
    id: int = Field(..., title="Category ID")
    name: str = Field(..., title="Category Name")
    created_at: datetime = Field(..., title="Creation Date")

# 카테고리 기본 스키마
class CategoryBase(BaseModel):
    name: str = Field(..., title="Category Name")

# 카테고리 생성 스키마 (created_at을 수동으로 설정하지 않음)
class CategoryCreate(CategoryBase):
    products: List[ProductResponse] = Field(..., title="Products in Category")

# 카테고리 응답 스키마 (created_at을 응답으로만 포함)
class CategoryResponse(CategoryBase):
    id: int = Field(..., title="Category ID")
    created_at: datetime = Field(..., title="Creation Date")  # 응답 시에만 표시

    class Config:
        orm_mode = True

# 카테고리 상세 응답 스키마 (상품 포함, created_at 응답)
class CategoryDetailResponse(CategoryResponse):
    products: List[ProductResponse] = Field(..., title="Products in Category")

    class Config:
        orm_mode = True