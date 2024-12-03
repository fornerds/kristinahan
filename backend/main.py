import os
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db
from models import *
from routes import *

# .env 파일 로드 (필요한 경우)
from dotenv import load_dotenv
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 주석 처리된 데이터 초기화 로직
    yield

app = FastAPI(lifespan=lifespan)

# CORS 미들웨어 설정
origins = [
    "https://apis.data.go.kr",  # 허용할 도메인
    "https://www.koreaexim.go.kr",  # 서브도메인 허용
    "https://kristinahan-hjox6nrbz-kangpungyuns-projects.vercel.app",
    "https://kristinahan.vercel.app",
    "https://localhost:3000",
    "https://localhost:8000",
    "http://localhost:3000",
    "http://localhost:8000"
    # 다른 도메인도 추가 가능
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
app.include_router(rates_routes.router)

# 기본 엔드포인트
@app.get("/")
async def read_root():
    return {"message": "Welcome to the FastAPI Application"}
