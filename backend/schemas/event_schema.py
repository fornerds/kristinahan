from pydantic import BaseModel, Field
from datetime import date
from typing import List

class EventBase(BaseModel):
    name: str = Field(..., title="Event Name")
    form_id: int = Field(..., title="Form ID")
    start_date: date = Field(..., title="Start Date")
    end_date: date = Field(..., title="End Date")
    inProgress: bool = Field(..., title="Event In Progress")

class EventResponse(EventBase):
    id: int = Field(..., title="Event ID")


    class Config:
        orm_mode = True

class EventCreate(EventBase):
    pass 

class EventUpdate(EventBase):
    pass

class ProductAttributeInfo(BaseModel):
    attribute_id: int
    value: str

class ProductInfo(BaseModel):
    name: str
    price: float
    attributes: List[ProductAttributeInfo]  # 속성 정보 추가

class FormInfo(BaseModel):
    name: str
    jacket_sleeve: str
    jacket_length: str
    jacket_form: str
    pants_circumference: str
    pants_length: str
    shirt_neck: str
    shirt_sleeve: str
    dress_back_form: str
    dress_length: str

class EventDetailResponse(BaseModel):
    event_name: str
    form: FormInfo
    category_name: str
    products: List[ProductInfo]

    class Config:
        orm_mode = True