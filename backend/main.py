from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from routes import auth_routes, event_routes, order_routes, admin_routes
from database import engine, Base

app = FastAPI()

# 정적 파일 서빙
app.mount("/static", StaticFiles(directory="static"), name="static")

# 데이터베이스 초기화
Base.metadata.create_all(bind=engine)

# 라우트 등록
app.include_router(auth_routes.router)
app.include_router(event_routes.router)
app.include_router(order_routes.router)
app.include_router(admin_routes.router)

@app.get("/", response_class=HTMLResponse)
async def read_root():
    return "<h1>Welcome to the FastAPI Application</h1>"