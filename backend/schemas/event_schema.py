from pydantic import BaseModel
from datetime import date

class EventBase(BaseModel):
    id: str
    name: str
    form_id: str
    start_date: date
    end_date: date
    inProgress: bool

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    class Config:
        orm_mode = True