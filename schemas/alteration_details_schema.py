from pydantic import BaseModel, ConfigDict
from typing import Optional

class AlterationDetailsInfo(BaseModel):
    form_repair_id: int
    figure: Optional[float] = None
    alterationFigure: Optional[float] = None