from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.schemas.event_schemas import EventCreate, EventRead, EventUpdate
from app.services.event_service import EventService
from app.database.database import get_db
from datetime import datetime
from app.schemas.user_schemas import UserRead
from app.security import admin_required  # Import de la dépendance admin_required

router = APIRouter(
    prefix="/events",
    tags=["events"]
)

@router.post("/", response_model=EventRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(admin_required)])
async def create_event(event: EventCreate, db: AsyncSession = Depends(get_db)):
    """Créer un nouvel événement (accessible uniquement aux administrateurs)."""
    created_event = await EventService.create_event(db, event)
    return created_event

@router.get("/{event_id}", response_model=EventRead)
async def get_event(event_id: int, db: AsyncSession = Depends(get_db)):
    """Récupérer un événement par son ID (accessible à tous les utilisateurs authentifiés)."""
    event = await EventService.get_event(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    return event

@router.get("/", response_model=List[EventRead])
async def get_all_events(
    db: AsyncSession = Depends(get_db),
    name: Optional[str] = Query(None, description="Filtrer par nom de l'événement"),
    date: Optional[datetime] = Query(None, description="Filtrer par date de l'événement"),
    location: Optional[str] = Query(None, description="Filtrer par localisation de l'événement")
):
    """Récupérer tous les événements avec filtrage optionnel (accessible à tous les utilisateurs authentifiés)."""
    events = await EventService.get_all_events(db, name=name, date=date, location=location)
    return events

@router.put("/{event_id}", response_model=EventRead, dependencies=[Depends(admin_required)])
async def update_event(event_id: int, event: EventUpdate, db: AsyncSession = Depends(get_db)):
    """Mettre à jour un événement existant (accessible uniquement aux administrateurs)."""
    updated_event = await EventService.update_event(db, event_id, event)
    if not updated_event:
        raise HTTPException(status_code=404, detail="Event not found.")
    return updated_event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(admin_required)])
async def delete_event(event_id: int, db: AsyncSession = Depends(get_db)):
    """Supprimer un événement existant (accessible uniquement aux administrateurs)."""
    success = await EventService.delete_event(db, event_id)
    if not success:
        raise HTTPException(status_code=404, detail="Event not found.")
    return