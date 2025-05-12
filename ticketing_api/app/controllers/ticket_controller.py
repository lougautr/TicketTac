# controllers/tickets.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.schemas.ticket_schemas import TicketCreate, TicketRead
from app.services.ticket_service import TicketService
from app.services.event_service import EventService

from app.database.database import get_db
from app.security import get_current_user
from app.schemas.user_schemas import UserRead
import aio_pika
import json
import os
import logging

router = APIRouter(
    prefix="/tickets",
    tags=["tickets"]
)

# Configure logging
logger = logging.getLogger("api-tickets")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(name)s: %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

async def publish_email_message(recipient: str, subject: str, body: str):
    """
    Publishes a message to RabbitMQ to send an email.
    """
    try:
        # Connect to RabbitMQ
        print("look here -------")
        print(os.getenv('RABBITMQ_URL'))
        connection = await aio_pika.connect_robust(os.getenv('RABBITMQ_URL'))
        async with connection:
            channel = await connection.channel()
            # Declare the exchange if not already declared
            exchange = await channel.declare_exchange("email_exchange", aio_pika.ExchangeType.FANOUT, durable=True)
            # Declare the queue
            queue = await channel.declare_queue("email_queue", durable=True)
            # Bind the queue to the exchange
            await queue.bind(exchange)
            
            message_body = json.dumps({
                "recipient": recipient,
                "subject": subject,
                "body": body
            }).encode()
            
            message = aio_pika.Message(body=message_body, delivery_mode=aio_pika.DeliveryMode.PERSISTENT)
            
            await exchange.publish(message, routing_key="")
            logger.info(f"Published email message to {recipient}")
    except Exception as e:
        logger.error(f"Failed to publish email message: {e}")

@router.post("/", response_model=TicketRead, status_code=status.HTTP_201_CREATED)
async def create_ticket(
    ticket_data: TicketCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserRead = Depends(get_current_user)
):
    print("hey")
    """
    Créer un nouveau ticket.
    
    Seul un utilisateur authentifié peut créer un ticket.
    """
    event = await EventService.get_event(db, ticket_data.event_id)
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.available_tickets <= 0:
        raise HTTPException(status_code=400, detail="No tickets available for this event.")
    
    ticket = await TicketService.create_ticket(db, ticket_data, current_user.id)

    if ticket is None:
        raise HTTPException(status_code=404, detail="Event not found.")
    if ticket == "No tickets available":
        raise HTTPException(status_code=400, detail="No tickets available for this event.")
    
    # Après la création du ticket, publier un message pour envoyer un email
    try:
        
        await publish_email_message(
            recipient=current_user.email,
            subject="Votre Achat de Ticket",
            body=f"Bonjour {current_user.first_name},\n\nMerci d'avoir acheté un ticket pour {event.name}.\nNumero de Ticket: {ticket.ticket_number}\n\nCordialement,\nL'équipe 4webd"
        )

    except Exception as e:
        logger.error(f"Error publishing email message: {e}")
        # Vous pouvez choisir de ne pas lever une exception ici pour ne pas impacter la création du ticket

    return ticket

@router.get("/{ticket_id}", response_model=TicketRead)
async def get_ticket(
    ticket_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserRead = Depends(get_current_user)
):
    """
    Récupérer un ticket par son ID.
    
    Seul un utilisateur authentifié peut accéder à cette route.
    """
    ticket = await TicketService.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found.")
    
    # Vérifier que le ticket appartient à l'utilisateur ou que l'utilisateur est admin
    if ticket.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Access forbidden.")
    
    return ticket

@router.get("/user/{user_id}", response_model=List[TicketRead])
async def get_tickets_by_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserRead = Depends(get_current_user)
):
    """
    Récupérer tous les tickets pour un utilisateur spécifique.
    
    Seul l'utilisateur lui-même ou un administrateur peut accéder à cette route.
    """
    # Vérifier que l'utilisateur accédant à ses propres tickets ou est admin
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Access forbidden.")
    
    tickets = await TicketService.get_tickets_by_user(db, user_id)
    return tickets    

@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ticket(
    ticket_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserRead = Depends(get_current_user)
):
    """
    Annuler un ticket existant.
    
    Seul le propriétaire du ticket ou un administrateur peut annuler un ticket.
    """
    # Récupérer le ticket pour vérifier la propriété
    ticket = await TicketService.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found.")
    
    if ticket.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Access forbidden.")
    
    success = await TicketService.delete_ticket(db, ticket_id)
    if not success:
        raise HTTPException(status_code=404, detail="Ticket not found.")
    return