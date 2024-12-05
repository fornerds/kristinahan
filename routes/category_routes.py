from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from sqlalchemy.exc import SQLAlchemyError
from database import get_db
from models import Category, Product, Attributes, ProductAttributes, FormCategory, OrderItems
from schemas import CategoryCreate, CategoryResponse, CategoryDetailResponse
from schemas.category_schema import ProductResponse

router = APIRouter()

# 카테고리와 상품 리스트 조회
@router.get("/categories", response_model=list[CategoryDetailResponse], summary="카테고리와 상품 리스트 조회", tags=["카테고리 API"])
async def get_categories_with_products(db: Session = Depends(get_db)):
    categories = db.query(Category).options(
        joinedload(Category.products).joinedload(Product.product_attributes).joinedload(ProductAttributes.attribute)
    ).all()

    if not categories:
        raise HTTPException(status_code=404, detail="No categories found")

    category_list = []
    for category in categories:
        product_list = []
        for product in category.products:
            # indexNumber를 기준으로 정렬하여 속성을 조회
            sorted_attributes = sorted(product.product_attributes, key=lambda attr: attr.indexNumber)
            attribute_list = [
                {"id": attr.attribute.id, "value": attr.attribute.value, "indexNumber": attr.indexNumber}
                for attr in sorted_attributes
            ] if product.product_attributes else []

            product_list.append(ProductResponse(
                id=product.id,
                name=product.name,
                price=product.price,
                attributes=attribute_list
            ))

        category_list.append({
            "id": category.id,
            "name": category.name,
            "created_at": category.created_at.date() if category.created_at else None,
            "products": product_list
        })

    return category_list

# 특정 카테고리 조회
@router.get("/categories/{categoryID}", response_model=CategoryDetailResponse, summary="카테고리와 상품 조회", tags=["카테고리 API"])
async def get_category_with_products(categoryID: int, db: Session = Depends(get_db)):
    category = db.query(Category).options(
        joinedload(Category.products).joinedload(Product.product_attributes).joinedload(ProductAttributes.attribute)
    ).filter(Category.id == categoryID).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    product_list = []
    for product in category.products:
        # indexNumber를 기준으로 정렬하여 속성을 조회
        sorted_attributes = sorted(product.product_attributes, key=lambda attr: attr.indexNumber)
        attribute_list = [
            {"id": attr.attribute.id, "value": attr.attribute.value, "indexNumber": attr.indexNumber}
            for attr in sorted_attributes
        ] if product.product_attributes else []

        product_list.append(ProductResponse(
            id=product.id,
            name=product.name,
            price=product.price,
            attributes=attribute_list
        ))

    return CategoryDetailResponse(
        id=category.id,
        name=category.name,
        created_at=category.created_at.date() if category.created_at else None,
        products=product_list
    )

# 카테고리 생성
@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED, summary="카테고리 생성", tags=["카테고리 API"])
async def create_category_with_products(category: CategoryCreate, db: Session = Depends(get_db)):
    try:
        new_category = Category(name=category.name)
        db.add(new_category)
        db.commit()
        db.refresh(new_category)

        for product_data in category.products:
            new_product = Product(name=product_data.name, price=product_data.price, category_id=new_category.id)
            db.add(new_product)
            db.commit()
            db.refresh(new_product)

            for index, attribute_data in enumerate(product_data.attributes):
                db_attribute = db.query(Attributes).filter(Attributes.value == attribute_data.value).first()
                if not db_attribute:
                    db_attribute = Attributes(value=attribute_data.value)
                    db.add(db_attribute)
                    db.commit()

                new_product_attribute = ProductAttributes(
                    product_id=new_product.id, 
                    attribute_id=db_attribute.id, 
                    indexNumber=index 
                )
                db.add(new_product_attribute)
                db.commit()

        return CategoryResponse(
            id=new_category.id,
            name=new_category.name,
        )
    except SQLAlchemyError:
        db.rollback()  # Rollback on error
        raise HTTPException(status_code=500, detail="Failed to create category with products")


# 카테고리 수정
@router.put("/categories/{categoryID}", response_model=CategoryResponse, summary="카테고리 수정", tags=["카테고리 API"])
async def update_category_with_products(categoryID: int, category: CategoryCreate, db: Session = Depends(get_db)):
    try:
        # 카테고리 조회
        db_category = db.query(Category).filter(Category.id == categoryID).first()
        if not db_category:
            raise HTTPException(status_code=404, detail="카테고리를 찾을 수 없습니다.")

        # 카테고리 이름 업데이트
        db_category.name = category.name
        db.commit()

        # 기존 상품 리스트 조회
        existing_products = db.query(Product).filter(Product.category_id == categoryID).all()
        existing_product_ids = {product.id for product in existing_products}

        new_product_ids = set()

        for product_data in category.products:
            # 기존 상품 여부 확인
            db_product = db.query(Product).filter(Product.name == product_data.name, Product.category_id == categoryID).first()

            if db_product:
                # 상품 가격 업데이트
                db_product.price = product_data.price
                db.commit()
                db.refresh(db_product)
            else:
                # 새로운 상품 추가
                db_product = Product(name=product_data.name, price=product_data.price, category_id=categoryID)
                db.add(db_product)
                db.commit()
                db.refresh(db_product)

            # 기존 속성(attribute) 조회
            existing_attributes = {attr.attribute.value for attr in db.query(ProductAttributes).filter(ProductAttributes.product_id == db_product.id).all()}
            new_attributes = {attr.value for attr in product_data.attributes}

            # 삭제할 속성 결정
            attributes_to_remove = existing_attributes - new_attributes

            # 새 속성 추가 및 업데이트 (indexNumber 업데이트 포함)
            for index, attribute_data in enumerate(product_data.attributes):
                db_attribute = db.query(Attributes).filter(Attributes.value == attribute_data.value).first()

                if not db_attribute:
                    # 새로운 속성 추가
                    db_attribute = Attributes(value=attribute_data.value)
                    db.add(db_attribute)
                    db.commit()
                    db.refresh(db_attribute)

                # ProductAttributes에서 속성과 상품의 연결 여부 확인
                product_attribute = db.query(ProductAttributes).filter(
                    ProductAttributes.product_id == db_product.id,
                    ProductAttributes.attribute_id == db_attribute.id
                ).first()

                if not product_attribute:
                    # 속성 연결 추가 (indexNumber 포함)
                    new_product_attribute = ProductAttributes(
                        product_id=db_product.id, 
                        attribute_id=db_attribute.id, 
                        indexNumber=index
                    )
                    db.add(new_product_attribute)
                    db.commit()
                else:
                    # 기존 속성 indexNumber 업데이트
                    product_attribute.indexNumber = index
                    db.commit()

            # 삭제할 속성 처리
            for value in attributes_to_remove:
                db_attribute = db.query(Attributes).filter(Attributes.value == value).first()
                if db_attribute:
                    db.query(ProductAttributes).filter(
                        ProductAttributes.product_id == db_product.id,
                        ProductAttributes.attribute_id == db_attribute.id
                    ).delete()
                    db.commit()

            new_product_ids.add(db_product.id)

        # 삭제할 상품 처리
        for product in existing_products:
            if product.id not in new_product_ids:
                # 상품이 주문서에서 사용 중인지 확인
                order_item_exists = db.query(OrderItems).filter(OrderItems.product_id == product.id).first()
                if order_item_exists:
                    raise HTTPException(
                        status_code=400,
                        detail=f"상품 '{product.name}'이(가) 주문서에서 사용 중이므로 삭제할 수 없습니다."
                    )
                # 상품에 연결된 속성 삭제
                db.query(ProductAttributes).filter(ProductAttributes.product_id == product.id).delete()
                # 상품 삭제
                db.delete(product)
                db.commit()

        return CategoryResponse(
            id=db_category.id,
            name=db_category.name,
        )
    except SQLAlchemyError:
        db.rollback()  # 오류 발생 시 롤백
        raise HTTPException(status_code=500, detail="카테고리와 상품 업데이트에 실패했습니다.")


# 카테고리 삭제 
@router.delete("/categories/{categoryID}", status_code=status.HTTP_204_NO_CONTENT, summary="카테고리 삭제", tags=["카테고리 API"])
async def delete_category_with_products(categoryID: int, db: Session = Depends(get_db)):
    try:
        db_category = db.query(Category).options(joinedload(Category.products)).filter(Category.id == categoryID).first()
        if not db_category:
            raise HTTPException(status_code=404, detail="Category not found")

        form_categories = db.query(FormCategory).filter(FormCategory.category_id == categoryID).all()
        for form_category in form_categories:
            db.delete(form_category)

        for product in db_category.products:
            db.query(ProductAttributes).filter(ProductAttributes.product_id == product.id).delete()
            db.delete(product)

        db.delete(db_category)
        db.commit()

        return {"detail": "Category, associated products, and form categories deleted successfully"}
    except SQLAlchemyError:
        db.rollback()  # 오류 발생 시 롤백
        raise HTTPException(status_code=500, detail="Failed to delete category with products")
