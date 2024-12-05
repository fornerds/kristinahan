from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class AttributeResponse(BaseModel):
    id: Optional[int] = None  
    value: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class AttributeNumberResponse(BaseModel):
    id: Optional[int] = None  
    value: Optional[str] = None
    indexNumber: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class ProductResponse(BaseModel):
    id: Optional[int] = None  
    name: Optional[str] = None 
    price: Optional[float] = None 
    attributes: Optional[List[AttributeNumberResponse]] = []


class CategoryResponse(BaseModel):
    id: Optional[int] = None  
    name: Optional[str] = None


class CategoryDetailResponse(CategoryResponse):
    products: Optional[List[ProductResponse]] = []


class CategoryCreate(BaseModel):
    name: Optional[str] = None
    products: Optional[List[ProductResponse]] = []
