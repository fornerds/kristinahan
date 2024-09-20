from pydantic import BaseModel, Field, ConfigDict

class AuthorBase(BaseModel):
    name: str = Field(..., title="Author Name")

    model_config = ConfigDict(from_attributes=True)

class AuthorResponse(AuthorBase):
    id: int = Field(..., title="Author ID")

    model_config = ConfigDict(from_attributes=True)

class AuthorCreate(AuthorBase):
    pass

class AuthorUpdate(AuthorBase):
    pass
