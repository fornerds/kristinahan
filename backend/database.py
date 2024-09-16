from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

# 데이터베이스 URL 설정
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

# SQLAlchemy 엔진 생성
engine = create_engine(SQLALCHEMY_DATABASE_URL)

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
