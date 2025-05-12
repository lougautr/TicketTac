from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EventBase(BaseModel):
    name: str
    description: Optional[str] = None
    location: str
    date: datetime
    total_tickets: int
    available_tickets: int

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    date: Optional[datetime] = None
    total_tickets: Optional[int] = None
    available_tickets: Optional[int] = None

class EventRead(EventBase):
    id: int
    available_tickets: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True