# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from ..utils import WhatsappNotificationService

router = APIRouter(prefix="/api/contact", tags=["contact"])

@router.post("/", response_model=schemas.Contact)
def submit_contact(contact: schemas.ContactCreate, db: Session = Depends(get_db)):
    new_contact = models.Contact(**contact.model_dump())
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    
    WhatsappNotificationService.send_contact_notification(new_contact)
    return new_contact

@router.get("/", response_model=List[schemas.Contact])
def get_all_contacts(db: Session = Depends(get_db)):
    return db.query(models.Contact).all()
