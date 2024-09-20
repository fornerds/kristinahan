from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings
import os

# 데이터베이스 URL 설정
database_url = settings.DATABASE_URL

# 만약 'postgres://'로 시작하면 'postgresql://'로 변경
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

# SQLAlchemy 엔진 생성
engine = create_engine(database_url)

# 세션 로컬 정의
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 베이스 클래스 생성
Base = declarative_base()

# 데이터베이스 세션 종속성
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
