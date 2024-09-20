from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Category, Product, Attributes, ProductAttributes
from schemas import CategoryCreate, CategoryResponse, CategoryDetailResponse, AttributeResponse,ProductResponse

router = APIRouter()

@router.get("/categories", response_model=list[CategoryDetailResponse], summary="카테고리와 상품 리스트 조회", tags=["카테고리 API"])
async def get_categories_with_products(db: Session = Depends(get_db)):
    """
    모든 카테고리와 각 카테고리에 속한 상품 리스트를 조회합니다.
    """
    categories = db.query(Category).all()
    if not categories:
        raise HTTPException(status_code=404, detail="No categories found")

    category_list = []
    for category in categories:
        products = db.query(Product).filter(Product.category_id == category.id).all()
        product_list = []
        for product in products:
            attributes = db.query(Attributes).join(ProductAttributes).filter(ProductAttributes.product_id == product.id).all()
            attribute_list = [{"attribute_id": attr.id, "value": attr.value} for attr in attributes]

            product_list.append({
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "attributes": attribute_list
            })

        category_list.append({
            "id": category.id,
            "name": category.name,
            "created_at": category.created_at,
            "products": product_list
        })

    return category_list

@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED, summary="카테고리 생성", tags=["카테고리 API"])
async def create_category_with_products(category: CategoryCreate, db: Session = Depends(get_db)):
    """
    새로운 카테고리와 해당 카테고리의 상품을 생성합니다.
    """
    # 새로운 카테고리 생성
    new_category = Category(name=category.name)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    # 각 상품에 대해 처리
    for product_data in category.products:
        # 상품은 이름과 상관없이 새로운 데이터를 생성
        new_product = Product(name=product_data.name, price=product_data.price, category_id=new_category.id)
        db.add(new_product)
        db.commit()
        db.refresh(new_product)

        # 속성 처리
        for attribute_data in product_data.attributes:
            # 속성은 유니크, 중복 속성 확인 후 생성
            db_attribute = db.query(Attributes).filter(Attributes.value == attribute_data['value']).first()
            if not db_attribute:
                # 새로운 속성 생성
                db_attribute = Attributes(value=attribute_data['value'])
                db.add(db_attribute)
                db.commit()

            # 상품-속성 연결
            product_attribute = db.query(ProductAttributes).filter(
                ProductAttributes.product_id == new_product.id,
                ProductAttributes.attribute_id == db_attribute.id
            ).first()

            if not product_attribute:
                # 새로운 상품-속성 관계 생성
                new_product_attribute = ProductAttributes(product_id=new_product.id, attribute_id=db_attribute.id)
                db.add(new_product_attribute)
                db.commit()

    return CategoryResponse(
        id=new_category.id,
        name=new_category.name,
        created_at=new_category.created_at
    )


@router.get("/categories/{categoryID}", response_model=CategoryDetailResponse, summary="카테고리와 상품 조회", tags=["카테고리 API"])
async def get_category_with_products(categoryID: int, db: Session = Depends(get_db)):
    """
    특정 카테고리와 해당 카테고리에 속한 상품을 조회합니다.
    """
    # 카테고리 조회
    category = db.query(Category).filter(Category.id == categoryID).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # 상품 및 속성 조회
    products = db.query(Product).filter(Product.category_id == category.id).all()
    product_list = []
    for product in products:
        # 상품에 속한 속성들 조회
        attributes = db.query(Attributes).join(ProductAttributes).filter(ProductAttributes.product_id == product.id).all()
        attribute_list = [AttributeResponse(attribute_id=attr.id, value=attr.value) for attr in attributes]

        # Pydantic 모델로 변환
        product_list.append(ProductResponse(
            id=product.id,
            name=product.name,
            price=product.price,
            attributes=attribute_list
        ))

    # 카테고리와 상품 리스트 반환 (Pydantic 모델 사용)
    return CategoryDetailResponse(
        id=category.id,
        name=category.name,
        created_at=category.created_at,
        products=product_list
    )

@router.put("/categories/{categoryID}", response_model=CategoryResponse, summary="카테고리 수정", tags=["카테고리 API"])
async def update_category_with_products(categoryID: int, category: CategoryCreate, db: Session = Depends(get_db)):
    """
    카테고리와 해당 상품 및 속성을 수정합니다.
    """
    # 카테고리 조회
    db_category = db.query(Category).filter(Category.id == categoryID).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    # 카테고리 이름 수정
    db_category.name = category.name
    db.commit()

    # 상품 및 속성 수정
    for product_data in category.products:
        # 상품은 동일한 이름이라도 새로운 데이터로 관리해야 하므로, 수정이 아닌 새로 추가
        new_product = Product(name=product_data.name, price=product_data.price, category_id=categoryID)
        db.add(new_product)
        db.commit()
        db.refresh(new_product)

        # 속성 수정
        for attribute_data in product_data.attributes:
            # 속성은 유니크, 중복 속성 확인 후 생성
            db_attribute = db.query(Attributes).filter(Attributes.value == attribute_data['value']).first()
            if not db_attribute:
                # 새로운 속성 생성
                db_attribute = Attributes(value=attribute_data['value'])
                db.add(db_attribute)
                db.commit()

            # 상품-속성 관계 확인 및 추가
            product_attribute = db.query(ProductAttributes).filter(
                ProductAttributes.product_id == new_product.id,
                ProductAttributes.attribute_id == db_attribute.id
            ).first()

            if not product_attribute:
                # 새로운 상품-속성 관계 생성
                new_product_attribute = ProductAttributes(product_id=new_product.id, attribute_id=db_attribute.id)
                db.add(new_product_attribute)
                db.commit()

    # 수정된 카테고리 응답 (Pydantic 스키마 사용)
    return CategoryResponse(
        id=db_category.id,
        name=db_category.name,
        created_at=db_category.created_at
    )


@router.delete("/categories/{categoryID}", status_code=status.HTTP_204_NO_CONTENT, summary="카테고리 삭제", tags=["카테고리 API"])
async def delete_category_with_products(categoryID: int, db: Session = Depends(get_db)):
    """
    카테고리와 해당 카테고리의 상품을 삭제합니다.
    """
    # 카테고리 조회
    db_category = db.query(Category).filter(Category.id == categoryID).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    # 카테고리에 속한 상품과 속성 삭제
    products = db.query(Product).filter(Product.category_id == categoryID).all()
    for product in products:
        db.query(ProductAttributes).filter(ProductAttributes.product_id == product.id).delete()
        db.delete(product)

    # 카테고리 삭제
    db.delete(db_category)
    db.commit()

    return {"detail": "Category and associated products deleted"}
