from pydantic import BaseModel, Field, ConfigDict

class AffiliationBase(BaseModel):
    name: str = Field(..., title="Affiliation Name")

    # Pydantic v2 설정으로 from_attributes를 활성화
    model_config = ConfigDict(from_attributes=True)

# Affiliation 생성용 스키마
class AffiliationCreate(AffiliationBase):
    pass

# Affiliation 업데이트용 스키마
class AffiliationUpdate(AffiliationBase):
    pass

# Affiliation 응답 스키마
class AffiliationResponse(AffiliationBase):
    id: int = Field(..., title="Affiliation ID")

    # Pydantic v2 설정으로 from_attributes를 활성화
    model_config = ConfigDict(from_attributes=True)
