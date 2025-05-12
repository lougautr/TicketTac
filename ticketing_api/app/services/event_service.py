from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from app.entities.event import Event
from app.schemas.event_schemas import EventCreate, EventUpdate
from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy import and_, or_

class EventService:
    @staticmethod
    async def create_event(db: AsyncSession, event_create: EventCreate) -> Event:
        new_event = Event(
            name=event_create.name,
            description=event_create.description,
            location=event_create.location,
            date=event_create.date,
            total_tickets=event_create.total_tickets,
            available_tickets=event_create.available_tickets
        )
        db.add(new_event)
        await db.commit()
        await db.refresh(new_event)
        return new_event

    @staticmethod
    async def get_event(db: AsyncSession, event_id: int) -> Optional[Event]:
        result = await db.execute(select(Event).where(Event.id == event_id))
        return result.scalars().first()

    @staticmethod
    async def get_all_events(db: AsyncSession, name: Optional[str] = None, date: Optional[datetime] = None, location: Optional[str] = None) -> List[Event]:
        query = select(Event)
        
        filters = []
        if name:
            filters.append(Event.name.ilike(f"%{name}%"))  # Recherche insensible à la casse
        if date:
            day_start = datetime.combine(date.date(), datetime.min.time())
            day_end = datetime.combine(date.date(), datetime.max.time())
            filters.append(Event.date >= day_start)
            filters.append(Event.date < day_end)
        if location:
            filters.append(Event.location.ilike(f"%{location}%"))  # Recherche insensible à la casse
        
        if filters:
            query = query.where(and_(*filters))
        
        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def update_event(db: AsyncSession, event_id: int, event_update: EventUpdate) -> Optional[Event]:
        event = await EventService.get_event(db, event_id)
        if not event:
            return None
        
        if event_update.name is not None:
            event.name = event_update.name
        if event_update.description is not None:
            event.description = event_update.description
        if event_update.location is not None:
            event.location = event_update.location
        if event_update.date is not None:
            event.date = event_update.date
        if event_update.total_tickets is not None:
            event.total_tickets = event_update.total_tickets
        if event_update.available_tickets is not None:
            event.available_tickets = event_update.available_tickets
        
        db.add(event)
        await db.commit()
        await db.refresh(event)
        return event

    @staticmethod
    async def delete_event(db: AsyncSession, event_id: int) -> bool:
        event = await EventService.get_event(db, event_id)
        if not event:
            return False
        await db.delete(event)
        await db.commit()
        return True