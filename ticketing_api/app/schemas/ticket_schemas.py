from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TicketBase(BaseModel):
    event_id: int
    purchase_date: Optional[datetime] = None

class TicketCreate(TicketBase):
    pass

class TicketRead(TicketBase):
    id: int
    ticket_number: str
    user_id: int
    created_at: datetime
    updated_at: datetime
    event_id: int

    class Config:
        orm_mode = True