from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class HeadlineResponse(BaseModel):
    id: int
    title: str
    link: str
    date: Optional[datetime]
    category: Optional[str]
    description: Optional[str]
    source: Optional[str]

    class Config:
        from_attributes = True