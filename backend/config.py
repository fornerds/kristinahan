import os

class Settings:
    PROJECT_NAME: str = "FastAPI Project"
    VERSION: str = "1.0.0"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./test.db")  # 기본 SQLite DB

settings = Settings()