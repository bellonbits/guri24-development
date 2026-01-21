from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.inquiry import InquiryStatus

# Request schemas
class InquiryCreate(BaseModel):
    property_id: UUID
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    message: str = Field(..., min_length=1)

class InquiryStatusUpdate(BaseModel):
    status: InquiryStatus

# Response schemas
class InquiryResponse(BaseModel):
    id: UUID
    property_id: UUID
    user_id: Optional[UUID]
    name: str
    email: str
    phone: Optional[str]
    message: str
    status: InquiryStatus
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
