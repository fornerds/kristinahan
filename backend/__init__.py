from fastapi import FastAPI
from .routes import router  # FastAPI 라우터

def create_application() -> FastAPI:
    app = FastAPI()


    # 라우트 등록
    app.include_router(router)

    return app

# FastAPI 애플리케이션 생성
app = create_application()
