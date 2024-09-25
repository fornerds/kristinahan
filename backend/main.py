import os
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from database import get_db
from models import *
from routes import *

# .env 파일 로드 (필요한 경우)
from dotenv import load_dotenv
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # try:
    #     with open("data.json", "r") as f:
    #         data = json.load(f)
    # except FileNotFoundError:
    #     print("No data file found. Skipping data initialization.")
    #     data = None



    # if data:
    #     # 1. 독립적인 테이블 삽입 (참조 없음)
    #     db1: Session = next(get_db())

    #     # Users
    #     users = data.get("user", [])
    #     for user in users:
    #         new_user = User(id=user["id"], password=user["password"], role=user["role"])
    #         db1.add(new_user)

    #     # Forms
    #     forms = data.get("form", [])
    #     for form in forms:
    #         new_form = Form(
    #             id=form["id"], name=form["name"], jacketSleeve=form["jacketSleeve"],
    #             jacketLength=form["jacketLength"], jacketForm=form["jacketForm"],
    #             pantsCircumference=form["pantsCircumference"], pantsLength=form["pantsLength"],
    #             shirtNeck=form["shirtNeck"], shirtSleeve=form["shirtSleeve"],
    #             dressBackForm=form["dressBackForm"], dressLength=form["dressLength"],
    #             created_at=form["created_at"]
    #         )
    #         db1.add(new_form)

    #     # Categories
    #     categories = data.get("category", [])
    #     for category in categories:
    #         new_category = Category(
    #             id=category["id"], name=category["name"], created_at=category["created_at"]
    #         )
    #         db1.add(new_category)

    #     db1.commit()
    #     db1.close()

    #     # 2. 독립적인 테이블 삽입 (Products, Attributes)
    #     db2: Session = next(get_db())

    #     # Products
    #     products = data.get("product", [])
    #     for product in products:
    #         new_product = Product(
    #             id=product["id"], name=product["name"], category_id=product["category_id"], price=product["price"]
    #         )
    #         db2.add(new_product)

    #     # Attributes
    #     attributes = data.get("attributes", [])
    #     for attribute in attributes:
    #         new_attribute = Attributes(
    #             id=attribute["id"], value=attribute["value"]
    #         )
    #         db2.add(new_attribute)

    #     db2.commit()
    #     db2.close()

    #     # 3. 참조 테이블 삽입 (ProductAttributes, Author, Affiliation)
    #     db3: Session = next(get_db())

    #     # Product Attributes
    #     product_attributes = data.get("productAttributes", [])
    #     for prod_attr in product_attributes:
    #         new_prod_attr = ProductAttributes(
    #             id=prod_attr["id"], product_id=prod_attr["product_id"], attribute_id=prod_attr["attribute_id"]
    #         )
    #         db3.add(new_prod_attr)

    #     # Authors
    #     authors = data.get("author", [])
    #     for author in authors:
    #         new_author = Author(
    #             id=author["id"], name=author["name"]
    #         )
    #         db3.add(new_author)

    #     # Affiliations
    #     affiliations = data.get("affiliation", [])
    #     for affiliation in affiliations:
    #         new_affiliation = Affiliation(
    #             id=affiliation["id"], name=affiliation["name"]
    #         )
    #         db3.add(new_affiliation)

    #     db3.commit()
    #     db3.close()

    #     # 4. Events 삽입 (Form을 참조)
    #     db4: Session = next(get_db())

    #     events = data.get("event", [])
    #     for event in events:
    #         new_event = Event(
    #             id=event["id"], name=event["name"], form_id=event["form_id"],
    #             start_date=event["start_date"], end_date=event["end_date"],
    #             inProgress=event["inProgress"]
    #         )
    #         db4.add(new_event)

    #     db4.commit()
    #     db4.close()

    #     # 5. Orders 삽입 (Event, Author, Affiliation을 참조)
    #     db5: Session = next(get_db())

    #     orders = data.get("order", [])
    #     for order in orders:
    #         new_order = Order(
    #             id=order["id"], event_id=order["event_id"], author_id=order["author_id"],
    #             created_at=order["created_at"], updated_at=order["updated_at"], status=order["status"],
    #             orderName=order["orderName"], contact=order["contact"], affiliation_id=order["affiliation_id"],
    #             address=order["address"], collectionMethod=order["collectionMethod"], notes=order["notes"],
    #             totalPrice=order["totalPrice"], advancePayment=order["advancePayment"], balancePayment=order["balancePayment"]
    #         )
    #         db5.add(new_order)

    #     db5.commit()
    #     db5.close()

    #     # 6. Order Items 삽입
    #     db6: Session = next(get_db())

    #     # Order Items
    #     order_items = data.get("orderItems", [])
    #     for order_item in order_items:
    #         new_order_item = OrderItems(
    #             id=order_item["id"], order_id=order_item["order_id"], product_id=order_item["product_id"],
    #             attribute_id=order_item["attribute_id"], quantity=order_item["quantity"], price=order_item["price"]
    #         )
    #         db6.add(new_order_item)

    #     db6.commit()
    #     db6.close()

    #     # 7. Payments 삽입
    #     db7: Session = next(get_db())

    #     # Payments
    #     payments = data.get("payments", [])
    #     for payment in payments:
    #         new_payment = Payments(
    #             id=payment["id"], order_id=payment["order_id"], payment_date=payment["payment_date"],
    #             cashAmount=payment["cashAmount"], cashCurrency=payment["cashCurrency"],
    #             cardAmount=payment["cardAmount"], cardCurrency=payment["cardCurrency"],
    #             tradeInAmount=payment["tradeInAmount"], tradeInCurrency=payment["tradeInCurrency"],
    #             notes=payment["notes"], paymentMethod=payment["paymentMethod"]
    #         )
    #         db7.add(new_payment)

    #     db7.commit()
    #     db7.close()

    #     # 8. Alteration Details 삽입
    #     db8: Session = next(get_db())

    #     # Alteration Details
    #     alteration_details = data.get("alterationDetails", [])
    #     for alteration in alteration_details:
    #         new_alteration = AlterationDetails(
    #             id=alteration["id"], order_id=alteration["order_id"], jacketSleeve=alteration["jacketSleeve"],
    #             jacketLength=alteration["jacketLength"], jacketForm=alteration["jacketForm"],
    #             pantsCircumference=alteration["pantsCircumference"], pantsLength=alteration["pantsLength"],
    #             shirtNeck=alteration["shirtNeck"], shirtSleeve=alteration["shirtSleeve"],
    #             dressBackForm=alteration["dressBackForm"], dressLength=alteration["dressLength"],
    #             notes=alteration["notes"]
    #         )
    #         db8.add(new_alteration)

    #     db8.commit()
    #     db8.close()

    #     # 9. Form Categories 삽입
    #     db9: Session = next(get_db())

    #     # Form Categories
    #     form_categories = data.get("form_category", [])
    #     for form_category in form_categories:
    #         new_form_category = FormCategory(
    #             id=form_category["id"], form_id=form_category["form_id"], category_id=form_category["category_id"]
    #         )
    #         db9.add(new_form_category)

    #     db9.commit()
    #     db9.close()

    #     print("Test data added to the database")

    yield

app = FastAPI(lifespan=lifespan)

# CORS 설정 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000", "https://kristinahan-hjox6nrbz-kangpungyuns-projects.vercel.app", "https://kristinahan.vercel.app"],  # 허용할 프론트엔드 도메인 추가
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메서드 허용
    allow_headers=["*"],  # 모든 헤더 허용
)

# 라우트 등록
app.include_router(auth_routes.router)
app.include_router(event_routes.router)
app.include_router(order_routes.router)
app.include_router(author_routes.router)
app.include_router(affiliation_routes.router)
app.include_router(category_routes.router)
app.include_router(form_routes.router)

# 기본 엔드포인트
@app.get("/")
async def read_root():
    return {"message": "Welcome to the FastAPI Application"}
