from fastapi import APIRouter

router = APIRouter()

@router.get("/admin/users")
async def get_users():
    return [{"user_id": 1, "name": "Admin User"}, {"user_id": 2, "name": "Regular User"}]
