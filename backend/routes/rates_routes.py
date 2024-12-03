from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
from dotenv import load_dotenv
import requests
import logging
import os
from sqlalchemy.orm import Session
from models import Rate
from database import get_db

# 공통 데이터 갱신 함수
import asyncio

# 환경 변수 로드
load_dotenv()

# 라우터 초기화
router = APIRouter()

# API 엔드포인트 및 인증 키 설정
GOLD_PRICE_ENDPOINT = "https://apis.data.go.kr/1160100/service/GetGeneralProductInfoService/getGoldPriceInfo"
EXCHANGE_RATE_ENDPOINT = "https://www.koreaexim.go.kr/site/program/financial/exchangeJSON"

GOLD_API_KEY = os.getenv("GOLD_API_KEY")
EXCHANGE_API_KEY = os.getenv("EXCHANGE_API_KEY")

# Pydantic 모델 정의
class GoldPriceInfo(BaseModel):
    gold_24k: float
    gold_18k: float
    gold_14k: float
    gold_10k: float
    basDt: str


class GoldPriceResponse(BaseModel):
    result_code: str
    result_msg: str
    items: list[GoldPriceInfo]


class ExchangeRateInfo(BaseModel):
    cur_unit: str
    deal_bas_r: float
    cur_nm: str


class ExchangeRateResponse(BaseModel):
    items: list[ExchangeRateInfo]
    search_date: str


# 금 시세 조회 API
@router.get("/getGoldPriceInfo", response_model=GoldPriceResponse, summary="금 시세 조회", tags=["Rates API"])
async def get_gold_price_info(
    db: Session = Depends(get_db),
    page_no: int = Query(1),
    num_of_rows: int = Query(1),
    result_type: str = Query("json"),
    bas_dt: Optional[str] = Query(None),
):
    # 데이터 갱신 함수 호출
    update_rate_data(db)

    # 최신 금 시세 데이터 조회
    latest_rate = db.query(Rate).order_by(Rate.search_dt.desc()).first()
    if latest_rate:
        return {
            "result_code": "DB",
            "result_msg": "DB 데이터에서 가져왔습니다.",
            "items": [
                {
                    "gold_24k": latest_rate.gold_24k,
                    "gold_18k": latest_rate.gold_18k,
                    "gold_14k": latest_rate.gold_14k,
                    "gold_10k": latest_rate.gold_10k,
                    "basDt": latest_rate.gold_bas_dt.strftime("%Y%m%d")
                }
            ],
        }

    raise HTTPException(status_code=404, detail="금 시세 데이터를 찾을 수 없습니다.")


# 환율 조회 API
@router.get("/getExchangeRateInfo", response_model=ExchangeRateResponse, summary="환율 조회", tags=["Rates API"])
async def get_exchange_rate_info(
    db: Session = Depends(get_db),
    search_date: Optional[str] = Query(None),
):
    # 데이터 갱신 함수 호출
    update_rate_data(db)

    # 최신 환율 데이터 조회
    latest_rate = db.query(Rate).order_by(Rate.search_dt.desc()).first()
    if latest_rate:
        return {
            "items": [
                {"cur_unit": "USD", "deal_bas_r": latest_rate.usd, "cur_nm": "US Dollar"},
                {"cur_unit": "JPY(100)", "deal_bas_r": latest_rate.jpy, "cur_nm": "Japanese Yen (100)"},
                {"cur_unit": "KRW", "deal_bas_r": latest_rate.krw, "cur_nm": "South Korean Won"}
            ],
            "search_date": latest_rate.exchange_bas_dt.strftime("%Y%m%d"),
        }

    raise HTTPException(status_code=404, detail="환율 데이터를 찾을 수 없습니다.")

update_lock = asyncio.Lock()

async def update_rate_data(db: Session):
    async with update_lock:  # 동기화 락 사용
        latest_rate = db.query(Rate).order_by(Rate.search_dt.desc()).first()
        now = datetime.now()

        if latest_rate:
            is_today = latest_rate.search_dt.date() == now.date()
            is_after_11_am = latest_rate.search_dt.hour >= 11
            now_is_after_11_am = now.hour >= 11

            if is_today and is_after_11_am:
                return
            if is_today and not now_is_after_11_am:
                return

        gold_data = None
        exchange_data = None
        max_days_back = 5

        for i in range(max_days_back):
            search_date = (now - timedelta(days=i)).strftime("%Y%m%d")
            if not gold_data:
                gold_data = fetch_gold_data(search_date)
            if not exchange_data:
                exchange_data = fetch_exchange_data(search_date)

            if gold_data and exchange_data:
                break

        if not gold_data and latest_rate:
            gold_data = {
                "gold_bas_dt": latest_rate.gold_bas_dt,
                "gold_24k": latest_rate.gold_24k,
                "gold_18k": latest_rate.gold_18k,
                "gold_14k": latest_rate.gold_14k,
                "gold_10k": latest_rate.gold_10k,
            }

        if not exchange_data and latest_rate:
            exchange_data = {
                "exchange_bas_dt": latest_rate.exchange_bas_dt,
                "usd": latest_rate.usd,
                "jpy": latest_rate.jpy,
                "krw": latest_rate.krw,
            }

        new_rate = Rate(
            gold_bas_dt=gold_data["gold_bas_dt"] if gold_data else None,
            gold_10k=gold_data["gold_10k"] if gold_data else None,
            gold_14k=gold_data["gold_14k"] if gold_data else None,
            gold_18k=gold_data["gold_18k"] if gold_data else None,
            gold_24k=gold_data["gold_24k"] if gold_data else None,
            exchange_bas_dt=exchange_data["exchange_bas_dt"] if exchange_data else None,
            usd=exchange_data["usd"] if exchange_data else None,
            jpy=exchange_data["jpy"] if exchange_data else None,
            krw=exchange_data["krw"] if exchange_data else None,
            search_dt=now,
        )
        db.add(new_rate)
        db.commit()

# 금 시세 데이터 조회
def fetch_gold_data(date: str):
    try:
        params = {
            "serviceKey": GOLD_API_KEY,
            "pageNo": 1,
            "numOfRows": 1,
            "resultType": "json",
            "basDt": date
        }
        response = requests.get(GOLD_PRICE_ENDPOINT, params=params)
        response.raise_for_status()
        data = response.json()

        if "response" not in data or "body" not in data["response"] or "items" not in data["response"]["body"]:
            return None

        items = data["response"]["body"]["items"]["item"]
        gold_item = items[0]
        clpr = float(gold_item["clpr"])

        return {
            "gold_bas_dt": datetime.strptime(date, "%Y%m%d").date(),
            "gold_24k": clpr,
            "gold_18k": clpr * 0.75,
            "gold_14k": clpr * 0.585,
            "gold_10k": clpr * 0.417,
        }
    except Exception as e:
        logging.error(f"Failed to fetch gold data: {e}")
        return None


# 환율 데이터 조회
def fetch_exchange_data(date: str):
    try:
        params = {
            "authkey": EXCHANGE_API_KEY,
            "searchdate": date,
            "data": "AP01"
        }
        response = requests.get(EXCHANGE_RATE_ENDPOINT, params=params, verify=False)
        response.raise_for_status()
        data = response.json()

        required_currencies = ["KRW", "JPY(100)", "USD"]
        filtered_items = [
            {
                "cur_unit": item.get("cur_unit"),
                "deal_bas_r": float(item["deal_bas_r"].replace(",", ""))
            }
            for item in data if item.get("cur_unit") in required_currencies
        ]

        if not filtered_items:
            return None

        return {
            "exchange_bas_dt": datetime.strptime(date, "%Y%m%d").date(),
            "usd": next((item["deal_bas_r"] for item in filtered_items if item["cur_unit"] == "USD"), None),
            "jpy": next((item["deal_bas_r"] for item in filtered_items if item["cur_unit"] == "JPY(100)"), None),
            "krw": next((item["deal_bas_r"] for item in filtered_items if item["cur_unit"] == "KRW"), None),
        }
    except Exception as e:
        logging.error(f"Failed to fetch exchange data: {e}")
        return None
