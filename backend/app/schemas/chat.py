from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class MessageResponse(BaseModel):
    id: UUID
    conversation_id: UUID
    sender_id: UUID
    content: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: UUID
    property_id: Optional[UUID]
    tenant_id: UUID
    agent_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]
    last_message: Optional[MessageResponse] = None
    
    # Optional: Include property/agent details if needed
    property_title: Optional[str] = None
    other_party_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class StartChatRequest(BaseModel):
    property_id: Optional[UUID] = None
    agent_id: UUID
    initial_message: str

class SendMessageRequest(BaseModel):
    content: str
