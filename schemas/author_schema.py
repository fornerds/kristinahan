from pydantic import BaseModel, ConfigDict
from typing import Optional

class AuthorResponse(BaseModel):
    id: int
    name: Optional[str] = None


class AuthorCreate(BaseModel):
    name: Optional[str] = None


class AuthorUpdate(BaseModel):
    name: Optional[str] = None