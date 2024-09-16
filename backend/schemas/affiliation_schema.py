from pydantic import BaseModel, Field

class AffiliationBase(BaseModel):
    name: str = Field(..., title="Affiliation Name")

    class Config:
        orm_mode = True

# Affiliation 생성용 스키마
class AffiliationCreate(AffiliationBase):
    pass

# Affiliation 업데이트용 스키마
class AffiliationUpdate(AffiliationBase):
    pass

# Affiliation 응답 스키마
class AffiliationResponse(AffiliationBase):
    id: int = Field(..., title="Affiliation ID")