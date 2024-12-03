from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import Form, Category, FormCategory, FormRepair, Order, Event
from schemas.form_schema import FormCreate, FormResponse, FormRepairResponse, FormUsedResponse

router = APIRouter()

# 주문서 양식 리스트 조회 API
@router.get("/forms", response_model=list[FormUsedResponse], summary="주문서 양식 리스트 조회", tags=["주문서 양식 API"])
async def get_forms(db: Session = Depends(get_db)):
    forms = db.query(Form).order_by(Form.id.desc()).options(joinedload(Form.form_repairs)).all()
    form_responses = []
    for form in forms:
        categories = db.query(Category).join(FormCategory).filter(FormCategory.form_id == form.id).all()
        category_list = [{"id": category.id, "name": category.name} for category in categories]
        
        repairs = [
            FormRepairResponse(
                id=repair.id,
                information=repair.information,
                unit=repair.unit,
                isAlterable=repair.isAlterable,
                standards=repair.standards,
                indexNumber=repair.indexNumber
            ) for repair in form.form_repairs
        ]

        # 주문서 양식 사용 여부 확인
        is_used = db.query(Order).join(Event).filter(Event.form_id == form.id).first() is not None

        form_responses.append(
            FormUsedResponse(
                id=form.id,
                name=form.name,
                repairs=repairs,
                categories=category_list,
                created_at=form.created_at,
                is_used=is_used 
            )
        )
    return form_responses

# 특정 주문서 양식 조회 API
@router.get("/forms/{formID}", response_model=FormUsedResponse, summary="특정 주문서 양식 조회", tags=["주문서 양식 API"])
async def get_form(formID: int, db: Session = Depends(get_db)):
    form = db.query(Form).options(joinedload(Form.form_repairs)).filter(Form.id == formID).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    categories = db.query(Category).join(FormCategory).filter(FormCategory.form_id == formID).all()
    category_list = [{"id": category.id, "name": category.name} for category in categories]

    repairs = [
        FormRepairResponse(
            id=repair.id,
            information=repair.information,
            unit=repair.unit,
            isAlterable=repair.isAlterable,
            standards=repair.standards,
            indexNumber=repair.indexNumber
        ) for repair in form.form_repairs
    ]

    # 주문서 양식 사용 여부 확인
    is_used = db.query(Order).join(Event).filter(Event.form_id == formID).first() is not None

    return FormUsedResponse(
        id=form.id,
        name=form.name,
        repairs=repairs,
        categories=category_list,
        created_at=form.created_at,
        is_used=is_used  # 추가된 필드
    )

# 주문서 양식 생성 API
@router.post("/forms", response_model=FormResponse, status_code=status.HTTP_201_CREATED, summary="주문서 양식 생성", tags=["주문서 양식 API"])
async def create_form(form: FormCreate, db: Session = Depends(get_db)):
    try:
        new_form = Form(name=form.name)
        db.add(new_form)
        db.flush()

        for category_id in form.categories:
            form_category = FormCategory(form_id=new_form.id, category_id=category_id)
            db.add(form_category)

        for idx, repair in enumerate(form.repairs, start=1):
            form_repair = FormRepair(
                form_id=new_form.id,
                information=repair.information,
                unit=repair.unit,
                isAlterable=repair.isAlterable,
                standards=repair.standards,
                indexNumber=idx  
            )
            db.add(form_repair)

        db.commit()
        categories = db.query(Category).filter(Category.id.in_(form.categories)).all()
        category_list = [{"id": category.id, "name": category.name} for category in categories]

        return FormResponse(
            id=new_form.id,
            name=new_form.name,
            repairs=[FormRepairResponse(
                id=repair.id,
                information=repair.information,
                unit=repair.unit,
                isAlterable=repair.isAlterable,
                standards=repair.standards,
                indexNumber=repair.indexNumber
            ) for repair in new_form.form_repairs],
            categories=category_list,
            created_at=new_form.created_at
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"양식 생성 중 오류 발생: {str(e)}")

# 주문서 양식 수정 API
@router.put("/forms/{formID}", response_model=FormResponse, summary="주문서 양식 수정", tags=["주문서 양식 API"])
async def update_form(formID: int, form: FormCreate, db: Session = Depends(get_db)):
    try:
        # 기존 Form 검색
        existing_form = db.query(Form).filter(Form.id == formID).first()
        if not existing_form:
            raise HTTPException(status_code=404, detail="Form not found")
        
        # Form 업데이트
        existing_form.name = form.name
        db.flush()

        # 기존 repairs 삭제 및 업데이트
        db.query(FormRepair).filter(FormRepair.form_id == formID).delete()
        for repair in form.repairs:
            new_repair = FormRepair(
                form_id=formID,
                information=repair.information,
                unit=repair.unit,
                isAlterable=repair.isAlterable,
                standards=repair.standards,
            )
            db.add(new_repair)

        # 기존 categories 삭제 및 업데이트
        db.query(FormCategory).filter(FormCategory.form_id == formID).delete()
        for category_id in form.categories:
            new_category = FormCategory(form_id=formID, category_id=category_id)
            db.add(new_category)

        db.commit()


        # 카테고리 조회 및 리스트 생성
        categories = db.query(Category).filter(Category.id.in_(form.categories)).all()
        category_list = [{"id": category.id, "name": category.name} for category in categories]

        # 수정된 양식 반환
        return FormResponse(
            id=existing_form.id,
            name=existing_form.name,
            repairs=[FormRepairResponse(
                id=repair.id,
                information=repair.information,
                unit=repair.unit,
                isAlterable=repair.isAlterable,
                standards=repair.standards,
                indexNumber=repair.indexNumber
            ) for repair in existing_form.form_repairs],
            categories=category_list,
            created_at=existing_form.created_at
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"양식 수정 중 오류 발생: {str(e)}")

@router.put("/forms/repair/{formID}", response_model=FormResponse, summary="양식 수정(수선)", tags=["주문서 양식 API"])
async def update_form(formID: int, form: FormCreate, db: Session = Depends(get_db)):
    try:
        # 기존 Form 검색
        existing_form = db.query(Form).filter(Form.id == formID).first()
        if not existing_form:
            raise HTTPException(status_code=404, detail="양식을 찾을 수 없습니다.")
        
        # 양식 이름 업데이트
        if form.name:
            existing_form.name = form.name
        db.flush()

        # 기존 수선 정보 업데이트 (새로운 추가/삭제 불가능, 기존 정보만 수정 가능)
        for repair_data in form.repairs:
            db_repair = db.query(FormRepair).filter(
                FormRepair.id == repair_data.id,
                FormRepair.form_id == formID
            ).first()

            if not db_repair:
                raise HTTPException(
                    status_code=400,
                    detail=f"수선 정보 ID {repair_data.id}가 양식에 존재하지 않습니다."
                )

            # 수선 정보 수정
            if repair_data.unit is not None:
                db_repair.unit = repair_data.unit
            if repair_data.standards is not None:
                db_repair.standards = repair_data.standards
            if repair_data.isAlterable is not None:
                db_repair.isAlterable = repair_data.isAlterable

        db.flush()

        # 카테고리는 추가/삭제 없이 기존 데이터 유지
        existing_categories = db.query(FormCategory).filter(FormCategory.form_id == formID).all()
        category_ids = [category.category_id for category in existing_categories]

        # 카테고리 데이터 조회 및 응답 형식 생성
        categories = db.query(Category).filter(Category.id.in_(category_ids)).all()
        category_list = [{"id": category.id, "name": category.name} for category in categories]

        db.commit()

        # 수정된 양식 반환
        return FormResponse(
            id=existing_form.id,
            name=existing_form.name,
            repairs=[
                FormRepairResponse(
                    id=repair.id,
                    information=repair.information,
                    unit=repair.unit,
                    isAlterable=repair.isAlterable,
                    standards=repair.standards,
                    indexNumber=repair.indexNumber
                ) for repair in existing_form.form_repairs
            ],
            categories=category_list,
            created_at=existing_form.created_at
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"양식 수정 중 오류 발생: {str(e)}")

# 주문서 양식 복제 API
@router.post("/forms/{formID}/duplicate", response_model=FormResponse, status_code=status.HTTP_201_CREATED, summary="주문서 양식 복제", tags=["주문서 양식 API"])
async def duplicate_form(formID: int, db: Session = Depends(get_db)):
    try:
        original_form = db.query(Form).filter(Form.id == formID).first()
        if not original_form:
            raise HTTPException(status_code=404, detail="Form not found")

        new_form_name = f"{original_form.name}의 사본"
        new_form = Form(name=new_form_name)
        db.add(new_form)
        db.flush()

        original_categories = db.query(FormCategory).filter(FormCategory.form_id == formID).all()
        for category_link in original_categories:
            new_form_category = FormCategory(
                form_id=new_form.id,
                category_id=category_link.category_id,
            )
            db.add(new_form_category)

        original_repairs = db.query(FormRepair).filter(FormRepair.form_id == formID).all()
        for idx, repair in enumerate(original_repairs, start=1):
            new_repair = FormRepair(
                form_id=new_form.id,
                information=repair.information,
                unit=repair.unit,
                isAlterable=repair.isAlterable,
                standards=repair.standards,
                indexNumber=idx
            )
            db.add(new_repair)

        db.commit()

        categories = db.query(Category).filter(Category.id.in_([cat.category_id for cat in original_categories])).all()
        category_list = [{"id": category.id, "name": category.name} for category in categories]
        repairs = [
            FormRepairResponse(
                id=repair.id,
                information=repair.information,
                unit=repair.unit,
                isAlterable=repair.isAlterable,
                standards=repair.standards,
                indexNumber=repair.indexNumber
            ) for repair in original_repairs
        ]

        return FormResponse(
            id=new_form.id,
            name=new_form.name,
            repairs=repairs,
            categories=category_list,
            created_at=new_form.created_at
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"양식 복제 중 오류 발생: {str(e)}")

# 주문서 양식 삭제 API
@router.delete("/forms/{formID}", status_code=status.HTTP_204_NO_CONTENT, summary="주문서 양식 삭제", tags=["주문서 양식 API"])
async def delete_form(formID: int, db: Session = Depends(get_db)):
    try:
        db_form = db.query(Form).filter(Form.id == formID).first()
        if not db_form:
            raise HTTPException(status_code=404, detail="Form not found")

        # 양식과 연결된 카테고리 삭제
        db.query(FormCategory).filter(FormCategory.form_id == formID).delete()

        db.delete(db_form)
        db.commit()  # 모든 작업이 성공적으로 완료되면 커밋

        return {"detail": "Form deleted"}

    except Exception as e:
        db.rollback()  # 오류 발생 시 롤백
        raise HTTPException(status_code=500, detail=f"양식 삭제 중 오류 발생: {str(e)}")
