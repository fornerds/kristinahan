from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

from schemas.category_schema import CategoryResponse

class FormRepairCreate(BaseModel):
    information: Optional[str] = None
    unit: Optional[str] = None
    isAlterable: Optional[bool] = None
    standards: Optional[str] = None

class FormRepairResponse(BaseModel):
    id: Optional[int] = None
    information: Optional[str] = None
    unit: Optional[str] = None
    isAlterable : Optional[bool]
    standards: Optional[str] = None
    indexNumber: Optional[int] = None

class FormResponse(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    repairs: List[FormRepairResponse] = []
    created_at: Optional[datetime] = None
    categories: Optional[List[CategoryResponse]] = []

class FormUsedResponse(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    repairs: List[FormRepairResponse] = []
    created_at: Optional[datetime] = None
    categories: Optional[List[CategoryResponse]] = []
    is_used: bool

class FormCreate(BaseModel):
    name: Optional[str] = None
    repairs: List[FormRepairCreate] = []
    categories: List[int] = []
