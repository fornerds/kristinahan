from pydantic import BaseModel, Field


class FormCategorySchema(BaseModel):
    id: int = Field(..., title="Form Category ID")
    form_id: int = Field(..., title="Form ID")
    category_id: int = Field(..., title="Category ID")
