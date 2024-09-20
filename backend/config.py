from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

# .env 파일 로드
load_dotenv()

class Settings(BaseSettings):
    DATABASE_URL: str

settings = Settings()
