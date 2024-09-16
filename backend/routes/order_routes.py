from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
from datetime import datetime, timezone
import pandas as pd
from io import BytesIO

from models import Order, Event, Payments, OrderItems, AlterationDetails, Payments
from models.order import OrderStatus
from schemas.order_schema import OrderListResponse, OrderDetailResponse, OrderCreate, OrderStatusUpdate
from schemas.alteration_details_schema import AlterationDetailsCreate
from database import get_db
from typing import Optional

router = APIRouter()

@router.get("/orders", response_model=OrderListResponse, summary="주문서 조회(필터)", tags=["주문서 API"])
async def get_orders(
    event_name: Optional[str] = None,
    order_date_from: Optional[datetime] = None,
    order_date_to: Optional[datetime] = None,
    sort: Optional[str] = "order_date_asc",
    search: Optional[str] = None,
    status: Optional[str] = None,
    is_temp: Optional[bool] = None,
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    주문서 조회 API 필터 설명\n
    1.event_name:\n
    설명: 특정 이벤트 이름으로 주문서를 필터링.\n
    사용법: /orders?event_name=Fashion Week\n
    2.status:\n
    설명: 주문 상태로 필터링.\n
        Order_Completed = 'Order Completed' / 주문완료\n
        Packaging_Completed = 'Packaging Completed' / 포장완료\n
        Repair_Received = 'Repair Received' / 수선 접수\n
        Repair_Completed = 'Repair Completed' / 수선 완료\n
        In_delivery = 'In delivery' / 배송중\n
        Delivery_completed = 'Delivery completed' / 배송완료\n
        Receipt_completed = 'Receipt completed' / 수령완료\n
        Accommodation = 'Accommodation' / 숙소\n
    사용법: /orders?status=Order_Completed\n
    3.order_date_from 및 order_date_to:\n
    설명: 지정된 기간 내의 주문서만 조회.\n
    사용법: /orders?order_date_from=2023-01-01&order_date_to=2023-12-31\n
    4.sort:\n
    설명: 주문서를 정렬 기준으로 정렬.\n
    옵션: order_date_asc (날짜 오름차순), order_date_desc (날짜 내림차순)\n
    사용법: /orders?sort=order_date_asc\n
    5.search:\n
    설명: 주문자 이름 또는 배송 주소로 검색. (수정 예정)\n
    사용법: /orders?search=John \n
    6.is_temp:\n
    설명: 일반/임시 주문서 선택 조회\n
    사용법: /orders?is_temp=False\n
    7.limit 및 offset:\n
    설명: 페이징을 위한 필터, limit은 반환할 주문서 수, offset은 시작 위치.\n
    사용법: /orders?limit=10&offset=20\n
    """
    query = db.query(Order).options(
        joinedload(Order.author),
        joinedload(Order.affiliation),
        joinedload(Order.payments),
        joinedload(Order.event)
    )

    if event_name:
        query = query.join(Event).filter(Event.name == event_name)

    if order_date_from and order_date_to:
        query = query.filter(and_(Order.created_at >= order_date_from, Order.created_at <= order_date_to))

    if search:
        query = query.filter(or_(Order.orderName.ilike(f"%{search}%"), Order.address.ilike(f"%{search}%")))

    if status:
        query = query.filter(Order.status == status)

    if is_temp is not None:
        query = query.filter(Order.isTemporary == is_temp)

    # 정렬 옵션 처리
    if sort == "order_date_asc":
        query = query.order_by(Order.created_at.asc())
    elif sort == "order_date_desc":
        query = query.order_by(Order.created_at.desc())

    # 페이징 처리
    total_orders = query.count()
    query = query.offset(offset).limit(limit)

    # 주문서 리스트 조회
    orders = query.all()

    order_list = []
    for order in orders:
        payment_list = [
            {
                "payment_date": payment.payment_date,
                "cashAmount": payment.cashAmount,
                "cashCurrency": payment.cashCurrency,
                "cardAmount": payment.cardAmount,
                "cardCurrency": payment.cardCurrency,
                "tradeInAmount": payment.tradeInAmount,
                "tradeInCurrency": payment.tradeInCurrency,
                "paymentMethod": payment.paymentMethod,
                "notes": payment.notes
            } for payment in order.payments
        ]

        product_list = [
            {
                "name": item.product.name,
                "price": item.product.price,
                "quantity": item.quantity,
                "attributes": [{"attribute_value": attr.value} for attr in item.product.attributes]
            } for item in order.order_items
        ]

        order_response = OrderDetailResponse(
            id=order.id,
            event_id=order.event.id if order.event else None,
            event_name=order.event.name if order.event else None,
            form_name=order.event.form.name if order.event and order.event.form else None,
            author_id=order.author.id if order.author else None,
            author_name=order.author.name if order.author else None,
            affiliation_id=order.affiliation.id if order.affiliation else None,
            affiliation_name=order.affiliation.name if order.affiliation else None,
            created_at=order.created_at,
            updated_at=order.updated_at,
            status=order.status,
            orderName=order.orderName,
            contact=order.contact,
            address=order.address,
            collectionMethod=order.collectionMethod,
            notes=order.notes,
            totalPrice=order.totalPrice,
            advancePayment=order.advancePayment,
            balancePayment=order.balancePayment,
            payments=payment_list,
            products=product_list
        )
        order_list.append(order_response)

    return OrderListResponse(orders=order_list, total=total_orders)


@router.get("/order/{orderID}", response_model=OrderDetailResponse, summary="주문서 상세 조회", tags=["주문서 API"])
async def get_order_detail(orderID: int, db: Session = Depends(get_db)):
    order = db.query(Order).options(
        joinedload(Order.event).joinedload(Event.form),  # 이벤트와 해당 폼을 미리 로드
        joinedload(Order.order_items).joinedload(OrderItems.product),  # 주문 항목과 해당 상품을 미리 로드
        joinedload(Order.payments)  # 결제 정보를 미리 로드
    ).filter(Order.id == orderID).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return OrderDetailResponse(
        id=order.id,
        event_id=order.event_id,
        author_id=order.author_id,
        affiliation_id=order.affiliation_id,
        event_name=order.event.name if order.event else None,
        form_name=order.event.form.name if order.event and order.event.form else None,
        products=[
            {
                "name": item.product.name,
                "price": item.product.price,
                "quantity": item.quantity,
                "attributes": [{"attribute_value": attr.value} for attr in item.product.attributes]
            } for item in order.order_items
        ],
        payments=[
            {
                "payment_date": payment.payment_date,
                "cashAmount": payment.cashAmount,
                "cashCurrency": payment.cashCurrency,
                "cardAmount": payment.cardAmount,
                "cardCurrency": payment.cardCurrency,
                "tradeInAmount": payment.tradeInAmount,
                "tradeInCurrency": payment.tradeInCurrency,
                "paymentMethod": payment.paymentMethod,
                "notes": payment.notes
            } for payment in order.payments
        ],
        created_at=order.created_at,
        updated_at=order.updated_at,
        status=order.status,
        orderName=order.orderName,
        contact=order.contact,
        address=order.address,
        collectionMethod=order.collectionMethod,
        notes=order.notes,
        totalPrice=order.totalPrice,
        advancePayment=order.advancePayment,
        balancePayment=order.balancePayment
    )

# 주문 상태 업데이트 API
@router.put("/orders/{orderID}/{order_status}", response_model=OrderStatusUpdate, summary="주문 상태 업데이트", tags=["주문서 API"])
async def update_order_status(
    orderID: int,
    order_status: str,
    db: Session = Depends(get_db)
):
    """
        Order_Completed = 'Order Completed' / 주문완료\n
        Packaging_Completed = 'Packaging Completed' / 포장완료\n
        Repair_Received = 'Repair Received' / 수선 접수\n
        Repair_Completed = 'Repair Completed' / 수선 완료\n
        In_delivery = 'In delivery' / 배송중\n
        Delivery_completed = 'Delivery completed' / 배송완료\n
        Receipt_completed = 'Receipt completed' / 수령완료\n
        Accommodation = 'Accommodation' / 숙소\n
    """
    # 주문서 조회
    order = db.query(Order).filter(Order.id == orderID).first()

    if not order:
        raise HTTPException(status_code=404, detail="주문서를 찾을 수 없습니다.")

    # 주문 상태 유효성 검사
    try:
        new_status = OrderStatus(order_status)
    except ValueError:
        raise HTTPException(status_code=400, detail="잘못된 주문 상태입니다.")

    # 주문 상태 업데이트
    order.status = new_status
    order.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(order)

    return {
        "id": order.id,
        "status": order.status,
        "updated_at": order.updated_at
    }

# 주문서 생성 및 수정 API (임시 저장과 동일)
@router.post("/order/save", summary="주문서 생성", status_code=status.HTTP_201_CREATED, tags=["주문서 API"])
@router.put("/order/save", summary="주문서 수정", tags=["주문서 API"])
async def save_order(order: OrderCreate, db: Session = Depends(get_db), is_update: bool = False, is_temp: bool = False):
    """
    POST 요청: 새로운 주문서 생성
    PUT 요청: 기존 주문서 수정
    is_temp: True면 임시 저장 주문서로 저장
    """
    if is_update:
        # 수정할 주문서 검색 (isTemporary 플래그를 확인하지 않음, 모든 주문서 가능)
        existing_order = db.query(Order).filter(Order.id == order.id).first()
        if not existing_order:
            raise HTTPException(status_code=404, detail="Order not found")

        # 주문 정보 수정
        existing_order.event_id = order.event_id
        existing_order.author_id = order.author_id
        existing_order.updated_at = datetime.now(timezone.utc)
        existing_order.status = order.status
        existing_order.orderName = order.orderName
        existing_order.contact = order.contact
        existing_order.affiliation_id = order.affiliation_id
        existing_order.address = order.address
        existing_order.collectionMethod = order.collectionMethod
        existing_order.notes = order.notes
        existing_order.totalPrice = order.totalPrice
        existing_order.advancePayment = order.advancePayment
        existing_order.balancePayment = order.balancePayment
        existing_order.isTemporary = is_temp  # 임시 저장 여부를 반영

        db.commit()
        db.refresh(existing_order)

        # 결제 정보 업데이트
        db.query(Payments).filter(Payments.order_id == existing_order.id).delete()
        for payment in order.payments:
            new_payment = Payments(
                order_id=existing_order.id,
                payment_date=payment.payment_date,
                cashAmount=payment.cashAmount,
                cashCurrency=payment.cashCurrency,
                cardAmount=payment.cardAmount,
                cardCurrency=payment.cardCurrency,
                tradeInAmount=payment.tradeInAmount,
                tradeInCurrency=payment.tradeInCurrency,
                paymentMethod=payment.paymentMethod,
                notes=payment.notes
            )
            db.add(new_payment)

        # 수선 정보 업데이트 (수선 정보가 있을 경우)
        if order.alteration_details:
            db.query(AlterationDetails).filter(AlterationDetails.order_id == existing_order.id).delete()
            alteration_data = order.alteration_details
            new_alteration = AlterationDetails(
                order_id=existing_order.id,
                jacketSleeve=alteration_data.jacketSleeve,
                jacketLength=alteration_data.jacketLength,
                jacketForm=alteration_data.jacketForm,
                pantsCircumference=alteration_data.pantsCircumference,
                pantsLength=alteration_data.pantsLength,
                shirtNeck=alteration_data.shirtNeck,
                shirtSleeve=alteration_data.shirtSleeve,
                dressBackForm=alteration_data.dressBackForm,
                dressLength=alteration_data.dressLength,
                notes=alteration_data.notes
            )
            db.add(new_alteration)

        db.commit()
        return {"message": "Order updated successfully!", "order_id": existing_order.id}

    else:
        # 새로운 주문서 생성
        new_order = Order(
            event_id=order.event_id,
            author_id=order.author_id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            status=order.status,
            orderName=order.orderName,
            contact=order.contact,
            affiliation_id=order.affiliation_id,
            address=order.address,
            collectionMethod=order.collectionMethod,
            notes=order.notes,
            totalPrice=order.totalPrice,
            advancePayment=order.advancePayment,
            balancePayment=order.balancePayment,
            isTemporary=is_temp  # 임시 저장 여부를 반영
        )

        db.add(new_order)
        db.commit()
        db.refresh(new_order)

        # 결제 정보 저장
        for payment in order.payments:
            new_payment = Payments(
                order_id=new_order.id,
                payment_date=payment.payment_date,
                cashAmount=payment.cashAmount,
                cashCurrency=payment.cashCurrency,
                cardAmount=payment.cardAmount,
                cardCurrency=payment.cardCurrency,
                tradeInAmount=payment.tradeInAmount,
                tradeInCurrency=payment.tradeInCurrency,
                paymentMethod=payment.paymentMethod,
                notes=payment.notes
            )
            db.add(new_payment)

        # 수선 정보 저장 (수선 정보가 있을 경우)
        if order.alteration_details:
            alteration_data = order.alteration_details
            new_alteration = AlterationDetails(
                order_id=new_order.id,
                jacketSleeve=alteration_data.jacketSleeve,
                jacketLength=alteration_data.jacketLength,
                jacketForm=alteration_data.jacketForm,
                pantsCircumference=alteration_data.pantsCircumference,
                pantsLength=alteration_data.pantsLength,
                shirtNeck=alteration_data.shirtNeck,
                shirtSleeve=alteration_data.shirtSleeve,
                dressBackForm=alteration_data.dressBackForm,
                dressLength=alteration_data.dressLength,
                notes=alteration_data.notes
            )
            db.add(new_alteration)

        db.commit()
        return {"message": "Order saved successfully!", "order_id": new_order.id}


# 임시 저장 주문서 API
@router.post("/temp/order/save", summary="임시 주문서 생성", status_code=status.HTTP_201_CREATED, tags=["주문서 API"])
@router.put("/temp/order/save", summary="임시 주문서 수정", tags=["주문서 API"])
async def save_temp_order(order: OrderCreate, db: Session = Depends(get_db), is_update: bool = False):
    return await save_order(order, db, is_update=is_update, is_temp=True)
    
@router.get("/orders/download", summary="(미구현)Excel 다운로드", tags=["주문서 API"])
async def download_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).all()

    # 데이터프레임 생성
    df = pd.DataFrame([{
        "Order ID": order.id,
        "Order Name": order.orderName,
        "Contact": order.contact,
        "Total Price": order.totalPrice,
        "Status": order.status,
        "Created At": order.created_at,
    } for order in orders])

    # Excel 파일로 변환
    excel_buffer = BytesIO()
    df.to_excel(excel_buffer, index=False, engine='openpyxl')
    excel_buffer.seek(0)

    return StreamingResponse(
        excel_buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=orders.xlsx"}
    )