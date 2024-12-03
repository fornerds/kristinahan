from pydantic import BaseModel, ConfigDict
from typing import Optional

class AffiliationResponse(BaseModel):
    id: int
    name: Optional[str] = None


class AffiliationCreate(BaseModel):
    name: Optional[str] = None


class AffiliationUpdate(BaseModel):
    name: Optional[str] = None