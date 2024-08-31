from fastapi import APIRouter

router = APIRouter()

@router.post("/order/save")
async def save_order(order: dict):
    return {"message": "Order saved successfully!", "order": order}