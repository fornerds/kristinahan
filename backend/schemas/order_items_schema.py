from pydantic import BaseModel, Field


class OrderItemsSchema(BaseModel):
    id: int = Field(..., title="Order Items ID")
    order_id: str = Field(..., title="Order ID")
    product_id: str = Field(..., title="Product ID")
    attribute_id: str = Field(..., title="Attribute ID")
    quantity: int = Field(..., title="Quantity")
    price: float = Field(..., title="Price")
