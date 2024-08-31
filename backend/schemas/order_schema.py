from pydantic import BaseModel

class Order(BaseModel):
    id: str
    orderer_name: str
    contact: str
    items: list