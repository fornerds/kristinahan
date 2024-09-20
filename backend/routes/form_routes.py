from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Form, Category, FormCategory
from schemas.form_schema import FormCreate, FormResponse

router = APIRouter()

# 주문서 양식 리스트 조회 API
@router.get("/forms", response_model=list[FormResponse], summary="주문서 양식 리스트 조회", tags=["주문서 양식 API"])
async def get_forms(db: Session = Depends(get_db)):
    """
    주문서 양식 리스트를 조회합니다.
    카테고리와 연결된 주문서 양식들을 포함합니다.
    """
    forms = db.query(Form).all()

    # 양식에 연결된 카테고리 정보도 함께 조회
    form_responses = []
    for form in forms:
        categories = db.query(Category).join(FormCategory).filter(FormCategory.from_id == form.id).all()
        category_list = [category.name for category in categories]
        form_responses.append(
            FormResponse(
                id=form.id,
                name=form.name,
                jacketSleeve=form.jacketSleeve,
                jacketLength=form.jacketLength,
                jacketForm=form.jacketForm,
                pantsCircumference=form.pantsCircumference,
                pantsLength=form.pantsLength,
                shirtNeck=form.shirtNeck,
                shirtSleeve=form.shirtSleeve,
                dressBackForm=form.dressBackForm,
                dressLength=form.dressLength,
                categories=category_list
            )
        )
    return form_responses

# 주문서 양식 생성 API
@router.post("/forms", response_model=FormResponse, status_code=status.HTTP_201_CREATED, summary="주문서 양식 생성", tags=["주문서 양식 API"])
async def create_form(form: FormCreate, db: Session = Depends(get_db)):
    """
    새로운 주문서 양식을 생성하고 카테고리와 연결합니다.
    """
    # 새로운 폼 생성
    new_form = Form(**form.model_dump(exclude={"categories"}))
    db.add(new_form)
    db.commit()

    # 선택된 카테고리와 양식 연결
    for category_id in form.categories:
        form_category = FormCategory(from_id=new_form.id, category_id=category_id)
        db.add(form_category)
    db.commit()

    # 카테고리 리스트 조회
    categories = db.query(Category).filter(Category.id.in_(form.categories)).all()
    category_list = [category.name for category in categories]

    # 카테고리 정보를 포함한 응답 생성
    return FormResponse(
        id=new_form.id,
        name=new_form.name,
        jacketSleeve=new_form.jacketSleeve,
        jacketLength=new_form.jacketLength,
        jacketForm=new_form.jacketForm,
        pantsCircumference=new_form.pantsCircumference,
        pantsLength=new_form.pantsLength,
        shirtNeck=new_form.shirtNeck,
        shirtSleeve=new_form.shirtSleeve,
        dressBackForm=new_form.dressBackForm,
        dressLength=new_form.dressLength,
        categories=category_list
    )

# 특정 주문서 양식 조회 API
@router.get("/forms/{formID}", response_model=FormResponse, summary="특정 주문서 양식 조회", tags=["주문서 양식 API"])
async def get_form(formID: int, db: Session = Depends(get_db)):
    """
    특정 주문서 양식과 해당 양식에 연결된 카테고리를 조회합니다.
    """
    form = db.query(Form).filter(Form.id == formID).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    # 해당 양식에 연결된 카테고리 조회
    categories = db.query(Category).join(FormCategory).filter(FormCategory.from_id == formID).all()
    category_list = [category.name for category in categories]

    return FormResponse(
        id=form.id,
        name=form.name,
        jacketSleeve=form.jacketSleeve,
        jacketLength=form.jacketLength,
        jacketForm=form.jacketForm,
        pantsCircumference=form.pantsCircumference,
        pantsLength=form.pantsLength,
        shirtNeck=form.shirtNeck,
        shirtSleeve=form.shirtSleeve,
        dressBackForm=form.dressBackForm,
        dressLength=form.dressLength,
        categories=category_list
    )

# 주문서 양식 수정 API
@router.put("/forms/{formID}", response_model=FormResponse, summary="주문서 양식 수정", tags=["주문서 양식 API"])
async def update_form(formID: int, form: FormCreate, db: Session = Depends(get_db)):
    """
    주문서 양식과 해당 양식에 연결된 카테고리를 수정합니다.
    """
    db_form = db.query(Form).filter(Form.id == formID).first()
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")

    # 양식 정보 업데이트
    db_form.name = form.name
    db_form.jacketSleeve = form.jacketSleeve
    db_form.jacketLength = form.jacketLength
    db_form.jacketForm = form.jacketForm
    db_form.pantsCircumference = form.pantsCircumference
    db_form.pantsLength = form.pantsLength
    db_form.shirtNeck = form.shirtNeck
    db_form.shirtSleeve = form.shirtSleeve
    db_form.dressBackForm = form.dressBackForm
    db_form.dressLength = form.dressLength

    # 기존 카테고리 연결 삭제
    db.query(FormCategory).filter(FormCategory.from_id == formID).delete()

    # 새 카테고리 연결
    for category_id in form.categories:
        form_category = FormCategory(from_id=formID, category_id=category_id)
        db.add(form_category)

    db.commit()

    # 카테고리 리스트 조회 후 응답 생성
    categories = db.query(Category).filter(Category.id.in_(form.categories)).all()
    category_list = [category.name for category in categories]

    return FormResponse(
        id=db_form.id,
        name=db_form.name,
        jacketSleeve=db_form.jacketSleeve,
        jacketLength=db_form.jacketLength,
        jacketForm=db_form.jacketForm,
        pantsCircumference=db_form.pantsCircumference,
        pantsLength=db_form.pantsLength,
        shirtNeck=db_form.shirtNeck,
        shirtSleeve=db_form.shirtSleeve,
        dressBackForm=db_form.dressBackForm,
        dressLength=db_form.dressLength,
        categories=category_list
    )

# 주문서 양식 삭제 API
@router.delete("/forms/{formID}", status_code=status.HTTP_204_NO_CONTENT, summary="주문서 양식 삭제", tags=["주문서 양식 API"])
async def delete_form(formID: int, db: Session = Depends(get_db)):
    """
    주문서 양식을 삭제하고 해당 양식과 연결된 카테고리도 삭제합니다.
    """
    db_form = db.query(Form).filter(Form.id == formID).first()
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")

    # 양식과 연결된 카테고리 삭제
    db.query(FormCategory).filter(FormCategory.from_id == formID).delete()

    db.delete(db_form)
    db.commit()
    return {"detail": "Form deleted"}
