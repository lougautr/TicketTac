from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.entities.ticket import Ticket
from app.entities.event import Event
from app.schemas.ticket_schemas import TicketCreate, TicketRead
from typing import Optional, List
from fastapi import HTTPException, status
import uuid
from datetime import datetime

class TicketService:
    @staticmethod
    async def create_ticket(db: AsyncSession, ticket_create: TicketCreate, user_id: int) -> Optional[TicketRead]:
        event_stmt = select(Event).where(Event.id == ticket_create.event_id)
        event_result = await db.execute(event_stmt)
        event = event_result.scalars().first()
        
        # Générer un ticket_number unique
        unique_ticket_number = str(uuid.uuid4())
        while await TicketService.ticket_number_exists(db, unique_ticket_number):
            unique_ticket_number = str(uuid.uuid4())
        
        # Préparez les données pour insérer
        current_time_naive = datetime.utcnow().replace(tzinfo=None)  # Convertissez datetime.utcnow() pour être naive

        # Créez le ticket
        new_ticket = Ticket(
            ticket_number=unique_ticket_number,
            event_id=ticket_create.event_id,
            user_id=user_id,
            purchase_date=ticket_create.purchase_date.replace(tzinfo=None) if ticket_create.purchase_date else current_time_naive,
            created_at=current_time_naive,
            updated_at=current_time_naive
        )
        db.add(new_ticket)
        
        # Mettre à jour les tickets disponibles
        event.available_tickets -= 1
        
        try:
            await db.commit()
            await db.refresh(new_ticket)
            return TicketRead.from_orm(new_ticket)
        except Exception as e:
            await db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
    @staticmethod
    async def ticket_number_exists(db: AsyncSession, ticket_number: str) -> bool:
        stmt = select(Ticket).where(Ticket.ticket_number == ticket_number)
        result = await db.execute(stmt)
        ticket = result.scalars().first()
        return ticket is not None

    @staticmethod
    async def get_ticket(db: AsyncSession, ticket_id: int) -> Optional[TicketRead]:
        stmt = select(Ticket).where(Ticket.id == ticket_id)
        result = await db.execute(stmt)
        ticket = result.scalars().first()
        return TicketRead.from_orm(ticket) if ticket else None
    
    @staticmethod
    async def get_tickets_by_user(db: AsyncSession, user_id: int) -> List[TicketRead]:
        stmt = select(Ticket).where(Ticket.user_id == user_id)
        result = await db.execute(stmt)
        tickets = result.scalars().all()
        return [TicketRead.from_orm(ticket) for ticket in tickets]
    
    @staticmethod
    async def delete_ticket(db: AsyncSession, ticket_id: int) -> bool:
        stmt = select(Ticket).where(Ticket.id == ticket_id)
        result = await db.execute(stmt)
        ticket = result.scalars().first()
        if not ticket:
            return False
        
        # Revenir les tickets disponibles
        event_stmt = select(Event).where(Event.id == ticket.event_id)
        event_result = await db.execute(event_stmt)
        event = event_result.scalars().first()
        if event:
            event.available_tickets += 1
        
        await db.delete(ticket)
        await db.commit()
        return True