from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import Event, Form, Category, Product, FormCategory, Order
from schemas.event_schema import EventDetailResponse, EventResponse, EventCreate, EventUpdate
from schemas.category_schema import CategoryResponse
from schemas.form_schema import FormResponse, FormRepairResponse

router = APIRouter()

# 1. 진행 중인 이벤트 조회
@router.get("/event/current", response_model=list[EventResponse], summary="진행 중인 이벤트 조회", tags=["이벤트 API"])
async def get_current_events(db: Session = Depends(get_db)):
    events = db.query(Event).filter(Event.inProgress == True).all()

    return [
        EventResponse(
            id=event.id,
            name=event.name,
            start_date=event.start_date,
            end_date=event.end_date,
            form_id=event.form_id,
            form_name=event.form.name if event.form else None,
            inProgress=event.inProgress
        )
        for event in events
    ]

# 2. 특정 이벤트 상세 조회
@router.get("/event/{event_id}", response_model=EventDetailResponse, summary="이벤트 상세 조회", tags=["이벤트 API"])
async def get_event_details(event_id: int, db: Session = Depends(get_db)):
    # 이벤트와 관련된 데이터를 조인하여 가져오기
    event = db.query(Event).options(
        joinedload(Event.form)
        .joinedload(Form.form_repairs),
        joinedload(Event.form)  
        .joinedload(Form.form_categories) 
        .joinedload(FormCategory.category)  
        .joinedload(Category.products)  
        .joinedload(Product.attributes)  
    ).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # 각 카테고리의 제품과 속성 정보를 수동으로 매핑하여 EventDetailResponse 생성
    event_detail = EventDetailResponse(
        id=event.id,
        name=event.name,
        start_date=event.start_date,
        end_date=event.end_date,
        inProgress=event.inProgress,
        form=FormResponse(
            id=event.form.id,
            name=event.form.name,
            repairs=[
                FormRepairResponse(
                    id=repair.id,
                    information=repair.information,
                    unit=repair.unit,
                    isAlterable=repair.isAlterable,
                    standards=repair.standards,
                    indexNumber=repair.indexNumber
                ) for repair in sorted(event.form.form_repairs, key=lambda r: r.indexNumber)
            ],
            categories=[
                CategoryResponse(id=fc.category.id, name=fc.category.name)
                for fc in event.form.form_categories
            ],
            created_at=event.form.created_at
        )
    )

    return event_detail

# 3. 모든 이벤트 조회
@router.get("/events", response_model=list[EventResponse], summary="모든 이벤트 조회", tags=["이벤트 API"])
async def get_all_events(db: Session = Depends(get_db)):
    events = db.query(Event).options(joinedload(Event.form)).all()
    return [ 
        EventResponse(
            id=event.id,
            name=event.name,
            form_id=event.form_id,
            form_name=event.form.name,
            start_date=event.start_date,
            end_date=event.end_date,
            inProgress=event.inProgress
        ) for event in events
    ]

# 4. 이벤트 생성
@router.post("/event", response_model=EventResponse, status_code=status.HTTP_201_CREATED, summary="이벤트 생성", tags=["이벤트 API"])
async def create_event(event: EventCreate, db: Session = Depends(get_db)):
    form = db.query(Form).filter(Form.id == event.form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    new_event = Event(
        name=event.name,
        form_id=event.form_id,
        start_date=event.start_date,
        end_date=event.end_date,
        inProgress=event.inProgress
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

# 5. 이벤트 업데이트
@router.put("/event/{event_id}", response_model=EventResponse, summary="이벤트 업데이트", tags=["이벤트 API"])
async def update_event(event_id: int, event: EventUpdate, db: Session = Depends(get_db)):
    # 1. 기존 이벤트 조회
    existing_event = db.query(Event).filter(Event.id == event_id).first()
    if not existing_event:
        raise HTTPException(status_code=404, detail="이벤트를 찾을 수 없습니다.")

    # 2. 새로운 양식(Form) 유효성 확인
    form = db.query(Form).filter(Form.id == event.form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="양식을 찾을 수 없습니다.")

    # 3. 기존 이벤트와 연결된 주문서 확인
    if existing_event.form_id != event.form_id:  # 새로운 양식으로 변경 요청 시
        related_orders = db.query(Order).filter(Order.event_id == event_id).all()
        if related_orders:
            raise HTTPException(
                status_code=400,
                detail="현재 이벤트와 연결된 주문서가 있어 양식을 변경할 수 없습니다."
            )

    # 4. 이벤트 정보 업데이트
    existing_event.name = event.name
    existing_event.form_id = event.form_id
    existing_event.start_date = event.start_date
    existing_event.end_date = event.end_date
    existing_event.inProgress = event.inProgress

    # 5. 데이터베이스 저장 및 반환
    db.commit()
    db.refresh(existing_event)
    return existing_event


# 6. 이벤트 삭제
@router.delete("/event/{event_id}", status_code=status.HTTP_204_NO_CONTENT, summary="이벤트 삭제", tags=["이벤트 API"])
async def delete_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    db.delete(event)
    db.commit()
    return {"message": "Event deleted successfully"}

# 7. 이벤트 진행 여부 수정
@router.put("/event/{event_id}/{in_progress}", response_model=EventResponse, summary="이벤트 진행 여부 수정", tags=["이벤트 API"])
async def update_event_progress(event_id: int, in_progress: bool, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    event.inProgress = in_progress
    db.commit()
    db.refresh(event)
    return event