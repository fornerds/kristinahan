from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import Event, Form, Category, Product, FormCategory
from schemas.event_schema import EventDetailResponse, EventResponse

router = APIRouter()

@router.get("/event/current", response_model=list[EventResponse], summary="진행 중인 이벤트 조회", tags=["이벤트 API"])
async def get_current_events(db: Session = Depends(get_db)):
    events = db.query(Event).filter(Event.inProgress == True).all()
    return events

@router.get("/event/{event_id}", response_model=EventDetailResponse, summary="이벤트 조회", tags=["이벤트 API"])
async def get_event_details(event_id: int, db: Session = Depends(get_db)):

    event = db.query(Event).options(
        joinedload(Event.form)
            .joinedload(Form.form_categories)
            .joinedload(FormCategory.category)
            .joinedload(Category.products)
            .joinedload(Product.attributes),  # 이 부분에서 attributes를 가져옵니다.
    ).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    form = event.form
    form_categories = form.form_categories  # Form과 연결된 FormCategory 리스트

    # 각 카테고리의 상품 및 속성 정보를 추출
    product_list = []
    for form_category in form_categories:
        category = form_category.category
        for product in category.products:
            attributes = [
                {
                    "attribute_id": attr.id,
                    "value": attr.value
                } for attr in product.attributes
            ]

            product_list.append({
                "name": product.name,
                "price": product.price,
                "attributes": attributes
            })

    # 결과를 반환
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
