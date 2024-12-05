from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional, List
from schemas.form_schema import FormResponse
from schemas.category_schema import CategoryDetailResponse

class EventResponse(BaseModel):
    id: int
    name: Optional[str]
    form_id: int
    form_name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    inProgress: bool



class EventDetailResponse(BaseModel):
    id: int
    name: Optional[str]
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    inProgress: Optional[bool] = None
    form: Optional[FormResponse]



class EventCreate(BaseModel):
    name: Optional[str]
    form_id: int
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    inProgress: bool


class EventUpdate(BaseModel):
    name: Optional[str] = None
    form_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    inProgress: Optional[bool] = None
