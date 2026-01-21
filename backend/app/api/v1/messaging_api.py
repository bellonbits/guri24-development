from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, desc
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID
from datetime import datetime, timezone

from app.database import get_db
from app.models.user import User
from app.models.property import Property
from app.models.inquiry import Inquiry
from app.models.messaging import Conversation, Message
from app.core.dependencies import get_current_user, get_current_active_user
from app.schemas.chat import ConversationResponse, MessageResponse, StartChatRequest, SendMessageRequest
from app.core.socket_manager import socket_manager
import json
from pydantic import TypeAdapter, BaseModel

router = APIRouter(prefix="/chat", tags=["chat"])

@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all conversations for the current user (as tenant or agent)"""
    stmt = select(Conversation).options(
        selectinload(Conversation.messages),
        selectinload(Conversation.property),
        selectinload(Conversation.tenant),
        selectinload(Conversation.agent)
    ).where(
        or_(
            Conversation.tenant_id == current_user.id,
            Conversation.agent_id == current_user.id
        )
    ).order_by(desc(Conversation.updated_at))
    
    result = await db.execute(stmt)
    conversations = result.scalars().all()
    
    # Format response to include property title and other party name
    response_data = []
    for conv in conversations:
        # Determine the "other" person
        if current_user.id == conv.tenant_id:
            other_user = conv.agent
        else:
            other_user = conv.tenant
            
        last_msg = conv.messages[-1] if conv.messages else None
        
        response_data.append({
            "id": conv.id,
            "property_id": conv.property_id,
            "tenant_id": conv.tenant_id,
            "agent_id": conv.agent_id,
            "created_at": conv.created_at,
            "updated_at": conv.updated_at,
            "property_title": conv.property.title if conv.property else "General Inquiry",
            "other_party_name": other_user.name if other_user else "Unknown",
            "last_message": last_msg
        })
        
    return response_data

@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    conversation_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get message history for a conversation"""
    # Verify access
    stmt = select(Conversation).where(
        and_(
            Conversation.id == conversation_id,
            or_(
                Conversation.tenant_id == current_user.id,
                Conversation.agent_id == current_user.id
            )
        )
    )
    result = await db.execute(stmt)
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found or access denied")
        
    # Fetch messages
    msg_stmt = select(Message).where(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at)
    
    msg_result = await db.execute(msg_stmt)
    return msg_result.scalars().all()

@router.post("/start", response_model=ConversationResponse)
async def start_chat(
    request: StartChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Start a new chat with an agent"""
    # Check if conversation already exists for this property + agent + tenant combo
    stmt = select(Conversation).where(
        and_(
            Conversation.tenant_id == current_user.id,
            Conversation.agent_id == request.agent_id,
            Conversation.property_id == request.property_id
        )
    )
    result = await db.execute(stmt)
    existing_conv = result.scalar_one_or_none()
    
    if existing_conv:
        # If exists, just add the message
        # We'll return the existing conversation, client should then call send_message or we do it here?
        # Let's post the message here too
        pass 
    else:
        # Create new
        existing_conv = Conversation(
            tenant_id=current_user.id,
            agent_id=request.agent_id,
            property_id=request.property_id
        )
        db.add(existing_conv)
        await db.commit()
        await db.refresh(existing_conv)
    


    # Add the initial message
    new_msg = Message(
        conversation_id=existing_conv.id,
        sender_id=current_user.id,
        content=request.initial_message,
        created_at=datetime.now(timezone.utc).replace(tzinfo=None) # Explicitly set naive UTC for asyncpg
    )
    db.add(new_msg)
    
    # Update conversation timestamp
    existing_conv.updated_at = new_msg.created_at
    
    await db.commit()
    
    # Emit via socket to both participants
    msg_data = MessageResponse.from_orm(new_msg).dict()
    # Serialize UUIDs and datetime for socket transport
    msg_json = json.loads(TypeAdapter(MessageResponse).dump_json(new_msg).decode())
    
    await socket_manager.emit_to_user(str(existing_conv.agent_id), "new_message", msg_json)
    await socket_manager.emit_to_user(str(existing_conv.tenant_id), "new_message", msg_json)
    
    # Construct response (simplified)
    return {
        "id": existing_conv.id,
        "property_id": existing_conv.property_id,
        "tenant_id": existing_conv.tenant_id,
        "agent_id": existing_conv.agent_id,
        "created_at": existing_conv.created_at,
        "updated_at": existing_conv.updated_at,
        "last_message": new_msg
    }

@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse)
async def send_message(
    conversation_id: UUID,
    request: SendMessageRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Reply to a conversation"""
    # Verify access first
    stmt = select(Conversation).where(
        and_(
            Conversation.id == conversation_id,
            or_(
                Conversation.tenant_id == current_user.id,
                Conversation.agent_id == current_user.id
            )
        )
    )
    result = await db.execute(stmt)
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    new_msg = Message(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        content=request.content
    )
    db.add(new_msg)
    
    # Update timestamp
    conversation.updated_at = new_msg.created_at
    
    await db.commit()
    await db.refresh(new_msg)

    # Emit via socket
    msg_json = json.loads(TypeAdapter(MessageResponse).dump_json(new_msg).decode())
    await socket_manager.emit_to_user(str(conversation.agent_id), "new_message", msg_json)
    await socket_manager.emit_to_user(str(conversation.tenant_id), "new_message", msg_json)

    return new_msg

@router.post("/inquiries/{inquiry_id}/reply", response_model=ConversationResponse)
async def reply_to_inquiry(
    inquiry_id: UUID,
    request: SendMessageRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Reply to an inquiry, converting it into a conversation if needed.
    """
    # 1. Fetch Inquiry
    stmt = select(Inquiry).where(Inquiry.id == inquiry_id)
    result = await db.execute(stmt)
    inquiry = result.scalar_one_or_none()
    
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
        
    if not inquiry.user_id:
        raise HTTPException(status_code=400, detail="Cannot reply to anonymous inquiry yet")
        
    # 2. Check for existing conversation
    # Agent is current_user, Tenant is inquiry.user_id
    conv_stmt = select(Conversation).where(
        and_(
            Conversation.tenant_id == inquiry.user_id,
            Conversation.agent_id == current_user.id,
            Conversation.property_id == inquiry.property_id
        )
    )
    conv_result = await db.execute(conv_stmt)
    conversation = conv_result.scalar_one_or_none()
    
    if not conversation:
        # Create new conversation
        conversation = Conversation(
            tenant_id=inquiry.user_id,
            agent_id=current_user.id,
            property_id=inquiry.property_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)
        
    # 3. Add Message
    new_msg = Message(
        conversation_id=conversation.id,
        sender_id=current_user.id,
        content=request.content,
        created_at=datetime.utcnow()
    )
    db.add(new_msg)
    
    # Update conversation timestamp
    conversation.updated_at = new_msg.created_at
    
    await db.commit()
    await db.refresh(conversation)
    
    # Emit via socket
    msg_json = json.loads(TypeAdapter(MessageResponse).dump_json(new_msg).decode())
    await socket_manager.emit_to_user(str(conversation.agent_id), "new_message", msg_json)
    await socket_manager.emit_to_user(str(conversation.tenant_id), "new_message", msg_json)
    
    # Simple re-fetch to get relations
    full_conv_stmt = select(Conversation).options(
        selectinload(Conversation.messages),
        selectinload(Conversation.property),
        selectinload(Conversation.tenant),
        selectinload(Conversation.agent)
    ).where(Conversation.id == conversation.id)
    
    full_res = await db.execute(full_conv_stmt)
    full_conv = full_res.scalar_one()
    
    other_user = full_conv.tenant 
    
    return {
        "id": full_conv.id,
        "property_id": full_conv.property_id,
        "tenant_id": full_conv.tenant_id,
        "agent_id": full_conv.agent_id,
        "created_at": full_conv.created_at,
        "updated_at": full_conv.updated_at,
        "property_title": full_conv.property.title if full_conv.property else "General Inquiry",
        "other_party_name": other_user.name if other_user else "Unknown",
        "last_message": new_msg
    }

class AgentInitiateChatRequest(BaseModel):
    tenant_id: UUID
    property_id: UUID
    initial_message: str

@router.post("/agent/initiate", response_model=ConversationResponse)
async def agent_initiate_chat(
    request: AgentInitiateChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Allow an Agent to initiate a chat with a tenant (e.g. from a Booking).
    """
    # Verify property ownership? Or just trust the agent?
    # Ideally check if property.agent_id == current_user.id
    
    # Check for existing conversation
    stmt = select(Conversation).where(
        and_(
            Conversation.tenant_id == request.tenant_id,
            Conversation.agent_id == current_user.id,
            Conversation.property_id == request.property_id
        )
    )
    result = await db.execute(stmt)
    existing_conv = result.scalar_one_or_none()
    
    if existing_conv:
        # Conversation exists, add message
        pass
    else:
        # Create new
        existing_conv = Conversation(
            tenant_id=request.tenant_id,
            agent_id=current_user.id,
            property_id=request.property_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(existing_conv)
        await db.commit()
        await db.refresh(existing_conv)
        
    # Add Message
    new_msg = Message(
        conversation_id=existing_conv.id,
        sender_id=current_user.id,
        content=request.initial_message,
        created_at=datetime.utcnow()
    )
    db.add(new_msg)
    
    existing_conv.updated_at = new_msg.created_at
    await db.commit()
    await db.refresh(new_msg) # Refresh message to get ID/timestamp
    
    # Emit Socket
    msg_json = json.loads(TypeAdapter(MessageResponse).dump_json(new_msg).decode())
    await socket_manager.emit_to_user(str(existing_conv.agent_id), "new_message", msg_json)
    await socket_manager.emit_to_user(str(existing_conv.tenant_id), "new_message", msg_json)
    
    # Return formatted response
    # We need to load relationships for the response model (property title etc)
    # Re-fetch with eager loading
    
    full_conv_stmt = select(Conversation).options(
        selectinload(Conversation.messages),
        selectinload(Conversation.property),
        selectinload(Conversation.tenant),
        selectinload(Conversation.agent)
    ).where(Conversation.id == existing_conv.id)
    
    full_res = await db.execute(full_conv_stmt)
    full_conv = full_res.scalar_one()
    
    other_user = full_conv.tenant
    
    return {
        "id": full_conv.id,
        "property_id": full_conv.property_id,
        "tenant_id": full_conv.tenant_id,
        "agent_id": full_conv.agent_id,
        "created_at": full_conv.created_at,
        "updated_at": full_conv.updated_at,
        "property_title": full_conv.property.title if full_conv.property else "Outreach",
        "other_party_name": other_user.name if other_user else "Unknown",
        "last_message": new_msg
    }
