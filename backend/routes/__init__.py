from fastapi import APIRouter

# 라우터 임포트
from .auth_routes import router as auth_router
from .event_routes import router as event_router
from .order_routes import router as order_router
from .affiliation_routes import router as affiliation_router
from .author_routes import router as author_router
from .category_routes import router as category_router
from .form_routes import router as form_router
from .rates_routes import router as rates_router

router = APIRouter()

# 각 라우터를 포함
router.include_router(auth_router)
router.include_router(event_router)
router.include_router(order_router)
router.include_router(affiliation_router)
router.include_router(author_router)
router.include_router(category_router)
router.include_router(form_router)
router.include_router(rates_router)

