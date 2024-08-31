from fastapi import APIRouter, HTTPException
from models.event import Event
from schemas.event_schema import EventCreate, EventResponse
from sqlalchemy.orm import Session
from database import get_db  # DB 세션 가져오는 함수

router = APIRouter()

@router.get("/event/current", response_model=list[EventResponse])
async def get_current_events(db: Session = Depends(get_db)):
    events = db.query(Event).filter(Event.inProgress == True).all()
    return events

@router.post("/event/", response_model=EventResponse)
async def create_event(event: EventCreate, db: Session = Depends(get_db)):
    db_event = Event(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event