from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from database import get_db
from models import User, Author, Affiliation, Category, Product, Form, Event, FormCategory, Attributes, ProductAttributes
from schemas.user_schema import UserResponse, UserCreate, UserUpdate
from schemas.author_schema import AuthorResponse, AuthorCreate, AuthorUpdate
from schemas.affiliation_schema import AffiliationResponse, AffiliationCreate, AffiliationUpdate
from schemas.category_schema import CategoryCreate, CategoryResponse, CategoryDetailResponse
from schemas.form_schema import FormCreate, FormResponse
from schemas.event_schema import EventCreate, EventResponse


router = APIRouter()

### 작성자 관리 ###
# 작성자 리스트 조회
@router.get("/admin/authors", response_model=list[AuthorResponse])
async def get_authors(db: Session = Depends(get_db)):
    authors = db.query(Author).all()
    return authors

# 작성자 생성
@router.post("/admin/authors", response_model=AuthorResponse, status_code=status.HTTP_201_CREATED)
async def create_author(author: AuthorCreate, db: Session = Depends(get_db)):
    new_author = Author(**author.model_dump())
    db.add(new_author)
    db.commit()
    db.refresh(new_author)
    return new_author

# 작성자 업데이트
@router.put("/admin/authors/{authorID}", response_model=AuthorResponse)
async def update_author(authorID: int, author: AuthorUpdate, db: Session = Depends(get_db)):
    db_author = db.query(Author).filter(Author.id == authorID).first()
    if not db_author:
        raise HTTPException(status_code=404, detail="Author not found")
    
    db_author.name = author.name
    db.commit()
    db.refresh(db_author)
    return db_author

# 작성자 삭제
@router.delete("/admin/authors/{authorID}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_author(authorID: int, db: Session = Depends(get_db)):
    db_author = db.query(Author).filter(Author.id == authorID).first()
    if not db_author:
        raise HTTPException(status_code=404, detail="Author not found")
    db.delete(db_author)
    db.commit()
    return {"detail": "Author deleted"}

### 소속 관리 ###
# 소속 리스트 조회
@router.get("/admin/affiliations", response_model=list[AffiliationResponse])
async def get_affiliations(db: Session = Depends(get_db)):
    return db.query(Affiliation).all()

# 소속 생성
@router.post("/admin/affiliations", response_model=AffiliationResponse, status_code=status.HTTP_201_CREATED)
async def create_affiliation(affiliation: AffiliationCreate, db: Session = Depends(get_db)):
    new_affiliation = Affiliation(**affiliation.model_dump())
    db.add(new_affiliation)
    db.commit()
    db.refresh(new_affiliation)
    return new_affiliation

# 소속 업데이트
@router.put("/admin/affiliations/{affiliationID}", response_model=AffiliationResponse)
async def update_affiliation(affiliationID: int, affiliation: AffiliationUpdate, db: Session = Depends(get_db)):
    db_affiliation = db.query(Affiliation).filter(Affiliation.id == affiliationID).first()
    if not db_affiliation:
        raise HTTPException(status_code=404, detail="Affiliation not found")

    db_affiliation.name = affiliation.name
    db.commit()
    db.refresh(db_affiliation)
    return db_affiliation

# 소속 삭제
@router.delete("/admin/affiliations/{affiliationID}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_affiliation(affiliationID: int, db: Session = Depends(get_db)):
    db_affiliation = db.query(Affiliation).filter(Affiliation.id == affiliationID).first()
    if not db_affiliation:
        raise HTTPException(status_code=404, detail="Affiliation not found")
    db.delete(db_affiliation)
    db.commit()
    return {"detail": "Affiliation deleted"}

### 카테고리 관리 ###

# 모든 카테고리와 상품 리스트 조회
@router.get("/admin/categories", response_model=list[CategoryDetailResponse])
async def get_categories_with_products(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    if not categories:
        raise HTTPException(status_code=404, detail="No categories found")

    category_list = []
    for category in categories:
        products = db.query(Product).filter(Product.category_id == category.id).all()
        product_list = []
        for product in products:
            attributes = db.query(Attributes).join(ProductAttributes).filter(ProductAttributes.product_id == product.id).all()
            product_list.append({
                "product": product,
                "attributes": attributes
            })
        category_list.append({
            "category": category,
            "products": product_list
        })

    return category_list

# 새 카테고리 생성
@router.post("/admin/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category_with_products(category: CategoryCreate, db: Session = Depends(get_db)):
    new_category = Category(name=category.name)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    for product_data in category.products:
        # 새 상품 추가
        new_product = Product(name=product_data.name, price=product_data.price, category_id=new_category.id)
        db.add(new_product)
        db.commit()
        db.refresh(new_product)

        # 속성 추가
        for attribute_data in product_data.attributes:
            db_attribute = db.query(Attributes).filter(Attributes.value == attribute_data).first()
            if not db_attribute:
                db_attribute = Attributes(value=attribute_data)
                db.add(db_attribute)
                db.commit()

            product_attribute = ProductAttributes(product_id=new_product.id, attribute_id=db_attribute.id)
            db.add(product_attribute)
            db.commit()

    return new_category

# 단일 카테고리 조회 (상품 및 속성 포함)
@router.get("/admin/categories/{categoryID}", response_model=CategoryDetailResponse)
async def get_category_with_products(categoryID: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == categoryID).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    products = db.query(Product).filter(Product.category_id == category.id).all()
    product_list = []
    for product in products:
        attributes = db.query(Attributes).join(ProductAttributes).filter(ProductAttributes.product_id == product.id).all()
        product_list.append({
            "product": product,
            "attributes": attributes
        })

    return {"category": category, "products": product_list}

# 카테고리 수정 (상품 및 속성 포함)
@router.put("/admin/categories/{categoryID}", response_model=CategoryResponse)
async def update_category_with_products(categoryID: int, category: CategoryCreate, db: Session = Depends(get_db)):
    db_category = db.query(Category).filter(Category.id == categoryID).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    db_category.name = category.name
    db.commit()

    # 기존 상품 및 속성 업데이트
    for product_data in category.products:
        db_product = db.query(Product).filter(Product.id == product_data.id, Product.category_id == categoryID).first()
        if db_product:
            db_product.name = product_data.name
            db_product.price = product_data.price
            db.commit()
        else:
            new_product = Product(name=product_data.name, price=product_data.price, category_id=categoryID)
            db.add(new_product)
            db.commit()
            db.refresh(new_product)

        for attribute_data in product_data.attributes:
            db_attribute = db.query(Attributes).filter(Attributes.value == attribute_data).first()
            if not db_attribute:
                db_attribute = Attributes(value=attribute_data)
                db.add(db_attribute)
                db.commit()

            product_attribute = db.query(ProductAttributes).filter(ProductAttributes.product_id == db_product.id, ProductAttributes.attribute_id == db_attribute.id).first()
            if not product_attribute:
                new_product_attribute = ProductAttributes(product_id=db_product.id, attribute_id=db_attribute.id)
                db.add(new_product_attribute)
                db.commit()

    return db_category

# 카테고리 삭제 (관련 상품 및 속성 삭제)
@router.delete("/admin/categories/{categoryID}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category_with_products(categoryID: int, db: Session = Depends(get_db)):
    db_category = db.query(Category).filter(Category.id == categoryID).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    products = db.query(Product).filter(Product.category_id == categoryID).all()
    for product in products:
        db.query(ProductAttributes).filter(ProductAttributes.product_id == product.id).delete()
        db.commit()
        db.delete(product)

    db.delete(db_category)
    db.commit()

    return {"detail": "Category and associated products deleted"}

### 주문서 양식 관리 ###
# 주문서 양식 리스트 조회 (양식에 연결된 카테고리 정보도 함께)
@router.get("/admin/forms", response_model=list[FormResponse])
async def get_forms(db: Session = Depends(get_db)):
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

# 주문서 양식 생성 (카테고리와 함께)
@router.post("/admin/forms", response_model=FormResponse)
async def create_form(form: FormCreate, db: Session = Depends(get_db)):
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

# 특정 주문서 양식 조회 (카테고리 정보 포함)
@router.get("/admin/forms/{formID}", response_model=FormResponse)
async def get_form(formID: int, db: Session = Depends(get_db)):
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

# 주문서 양식 업데이트 (카테고리 포함)
@router.put("/admin/forms/{formID}", response_model=FormResponse)
async def update_form(formID: int, form: FormCreate, db: Session = Depends(get_db)):
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

# 주문서 양식 삭제 (카테고리 연결도 함께 삭제)
@router.delete("/admin/forms/{formID}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_form(formID: int, db: Session = Depends(get_db)):
    db_form = db.query(Form).filter(Form.id == formID).first()
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")

    # 양식과 연결된 카테고리 삭제
    db.query(FormCategory).filter(FormCategory.from_id == formID).delete()

    db.delete(db_form)
    db.commit()
    return {"detail": "Form deleted"}


### 행사 관리 ###
# 행사 리스트 조회
@router.get("/admin/events", response_model=list[EventResponse])
async def get_events(db: Session = Depends(get_db)):
    return db.query(Event).all()

# 행사 생성
@router.post("/admin/event", response_model=EventResponse)
async def create_event(event: EventCreate, db: Session = Depends(get_db)):
    new_event = Event(**event.model_dump())
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

# 특정 행사 조회
@router.get("/admin/event/{eventID}", response_model=EventResponse)
async def get_event(eventID: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == eventID).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
