from pydantic import BaseModel, Field, ConfigDict
from enum import Enum
from datetime import datetime
from typing import List

class JacketSleeve(str, Enum):
    cm = 'cm'
    inch = 'inch'


class JacketLength(str, Enum):
    cm = 'cm'
    inch = 'inch'


class JacketForm(str, Enum):
    cm = 'cm'
    inch = 'inch'


class PantsCircumference(str, Enum):
    cm = 'cm'
    inch = 'inch'


class PantsLength(str, Enum):
    cm = 'cm'
    inch = 'inch'


class ShirtNeck(str, Enum):
    cm = 'cm'
    inch = 'inch'


class ShirtSleeve(str, Enum):
    cm = 'cm'
    inch = 'inch'


class DressBackForm(str, Enum):
    cm = 'cm'
    inch = 'inch'


class DressLength(str, Enum):
    cm = 'cm'
    inch = 'inch'


class FormSchema(BaseModel):
    id: int = Field(..., title="Form ID")
    name: str = Field(..., title="Form Name")
    jacketSleeve: JacketSleeve = Field(..., title="Jacket Sleeve Measurement")
    jacketLength: JacketLength = Field(..., title="Jacket Length Measurement")
    jacketForm: JacketForm = Field(..., title="Jacket Form Measurement")
    pantsCircumference: PantsCircumference = Field(..., title="Pants Circumference Measurement")
    pantsLength: PantsLength = Field(..., title="Pants Length Measurement")
    shirtNeck: ShirtNeck = Field(..., title="Shirt Neck Measurement")
    shirtSleeve: ShirtSleeve = Field(..., title="Shirt Sleeve Measurement")
    dressBackForm: DressBackForm = Field(..., title="Dress Back Form Measurement")
    dressLength: DressLength = Field(..., title="Dress Length Measurement")
    created_at: datetime = Field(..., title="Creation Date")

    model_config = ConfigDict(from_attributes=True)

class FormBase(BaseModel):
    name: str = Field(..., title="Form Name")

    model_config = ConfigDict(from_attributes=True)

class FormResponse(FormBase):
    id: int = Field(..., title="Form ID")
    created_at: datetime = Field(..., title="Created At")

    model_config = ConfigDict(from_attributes=True)

class FormCreate(FormBase):
    pass

# 주문서 양식 생성 스키마
class FormCreate(BaseModel):
    name: str = Field(..., title="Form Name")
    jacketSleeve: str = Field(..., title="Jacket Sleeve Size")
    jacketLength: str = Field(..., title="Jacket Length")
    jacketForm: str = Field(..., title="Jacket Form")
    pantsCircumference: str = Field(..., title="Pants Circumference")
    pantsLength: str = Field(..., title="Pants Length")
    shirtNeck: str = Field(..., title="Shirt Neck Size")
    shirtSleeve: str = Field(..., title="Shirt Sleeve Size")
    dressBackForm: str = Field(..., title="Dress Back Form")
    dressLength: str = Field(..., title="Dress Length")
    categories: List[str] = Field(..., title="Category IDs")  # 선택된 카테고리 리스트

    model_config = ConfigDict(from_attributes=True)

# 주문서 양식 응답 스키마
class FormResponse(BaseModel):
    id: int = Field(..., title="Form ID")
    name: str = Field(..., title="Form Name")
    jacketSleeve: str = Field(..., title="Jacket Sleeve Size")
    jacketLength: str = Field(..., title="Jacket Length")
    jacketForm: str = Field(..., title="Jacket Form")
    pantsCircumference: str = Field(..., title="Pants Circumference")
    pantsLength: str = Field(..., title="Pants Length")
    shirtNeck: str = Field(..., title="Shirt Neck Size")
    shirtSleeve: str = Field(..., title="Shirt Sleeve Size")
    dressBackForm: str = Field(..., title="Dress Back Form")
    dressLength: str = Field(..., title="Dress Length")
    categories: List[str] = Field(..., title="Category Names")  # 카테고리 이름 리스트

    model_config = ConfigDict(from_attributes=True)


