from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

# 수선 정보 기본 스키마
class AlterationDetailsBase(BaseModel):
    jacketSleeve: Optional[int] = Field(None, title="Jacket Sleeve")
    jacketLength: Optional[int] = Field(None, title="Jacket Length")
    jacketForm: Optional[int] = Field(None, title="Jacket Form")
    pantsCircumference: Optional[int] = Field(None, title="Pants Circumference")
    pantsLength: Optional[int] = Field(None, title="Pants Length")
    shirtNeck: Optional[int] = Field(None, title="Shirt Neck")
    shirtSleeve: Optional[int] = Field(None, title="Shirt Sleeve")
    dressBackForm: Optional[int] = Field(None, title="Dress Back Form")
    dressLength: Optional[int] = Field(None, title="Dress Length")
    notes: Optional[str] = Field(None, title="Additional Notes")

    # 최신 Pydantic 설정 적용
    model_config = ConfigDict(from_attributes=True)

# 수선 정보 생성 스키마
class AlterationDetailsCreate(AlterationDetailsBase):
    pass

# 수선 정보 응답 스키마
class AlterationDetailsResponse(AlterationDetailsBase):
    id: int = Field(..., title="Alteration ID")
    order_id: int = Field(..., title="Order ID")

    # 최신 Pydantic 설정 적용
    model_config = ConfigDict(from_attributes=True)
