from pydantic import BaseModel, Field

class AuthorBase(BaseModel):
    name: str = Field(..., title="Author Name") 

    class Config:
        orm_mode = True

class AuthorResponse(AuthorBase):
    id: int = Field(..., title="Author ID")

class AuthorCreate(AuthorBase):
    pass

class AuthorUpdate(AuthorBase):
    pass