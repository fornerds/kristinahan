from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import Event, Form, Category, Product, FormCategory
from schemas.event_schema import EventDetailResponse, EventResponse, EventCreate, EventUpdate

router = APIRouter()

# 1. 진행 중인 이벤트 조회
@router.get("/event/current", response_model=list[EventResponse], summary="진행 중인 이벤트 조회", tags=["이벤트 API"])
async def get_current_events(db: Session = Depends(get_db)):
    events = db.query(Event).filter(Event.inProgress == True).all()
    return events

# 2. 특정 이벤트 조회
@router.get("/event/{event_id}", response_model=EventDetailResponse, summary="이벤트 조회", tags=["이벤트 API"])
async def get_event_details(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).options(
        joinedload(Event.form)
        .joinedload(Form.form_categories)
        .joinedload(FormCategory.category)
        .joinedload(Category.products)
        .joinedload(Product.attributes)
    ).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    form = event.form
    form_categories = form.form_categories

    # 각 카테고리의 상품 및 속성 정보 추출
    product_list = []
    for form_category in form_categories:
        category = form_category.category
        for product in category.products:
            attributes = [
                {"attribute_id": attr.id, "value": attr.value} for attr in product.attributes
            ]
            product_list.append({
                "name": product.name,
                "price": product.price,
                "attributes": attributes
            })

    return {
        "event_name": event.name,
        "form": {
            "name": form.name,
            "jacket_sleeve": form.jacketSleeve,
            "jacket_length": form.jacketLength,
            "jacket_form": form.jacketForm,
            "pants_circumference": form.pantsCircumference,
            "pants_length": form.pantsLength,
            "shirt_neck": form.shirtNeck,
            "shirt_sleeve": form.shirtSleeve,
            "dress_back_form": form.dressBackForm,
            "dress_length": form.dressLength
        },
        "category_name": ', '.join([form_category.category.name for form_category in form_categories]),
        "products": product_list
    }

# 모든 이벤트 조회 (이벤트와 양식 이름 포함)
@router.get("/events", response_model=list[EventResponse], summary="모든 이벤트 조회", tags=["이벤트 API"])
async def get_all_events(db: Session = Depends(get_db)):
    events = db.query(Event).options(joinedload(Event.form)).all()
    return [ 
        EventResponse(
            id=event.id,
            name=event.name,
            form_id=event.form_id,
            form_name=event.form.name,  # 추가된 form_name 사용
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
    existing_event = db.query(Event).filter(Event.id == event_id).first()
    if not existing_event:
        raise HTTPException(status_code=404, detail="Event not found")

    form = db.query(Form).filter(Form.id == event.form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    existing_event.name = event.name
    existing_event.form_id = event.form_id
    existing_event.start_date = event.start_date
    existing_event.end_date = event.end_date
    existing_event.inProgress = event.inProgress

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