from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import enum
import os
import shutil
import uuid
from datetime import datetime
from sqlalchemy.orm.attributes import flag_modified
from app.database import get_db, Base
from app.models.user import User, AgentStatus, UserRole, UserStatus
from app.schemas.user import UserUpdate, UserResponse, PasswordChange, MessageResponse
from app.core.dependencies import get_current_active_user
from app.core.security import verify_password, get_password_hash
from app.models.verification_document import VerificationDocument, DocumentStatus

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user profile"""
    
    # Fetch documents from dedicated table
    stmt = select(VerificationDocument).where(VerificationDocument.user_id == current_user.id).order_by(VerificationDocument.uploaded_at.desc())
    res = await db.execute(stmt)
    docs = res.scalars().all()
    
    # Transform to list of dicts for the response model if needed, 
    # though UserResponse can handle ORM objects if configured correctly.
    # We'll be explicit to be safe.
    doc_list = []
    for d in docs:
        doc_list.append({
            "id": str(d.id),
            "name": d.name,
            "url": d.url,
            "category": d.category,
            "status": d.status,
            "uploaded_at": d.uploaded_at.isoformat()
        })

    print(f"DEBUG: PROFILE FETCH (Table Mode): User {current_user.email} has {len(doc_list)} docs in DB.")
    
    # Create the response data manually to ensure it matches the schema
    # Use ORM object for most fields, override verification_documents
    user_data = {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "phone": current_user.phone,
        "role": current_user.role,
        "status": current_user.status,
        "agent_status": current_user.agent_status,
        "email_verified": current_user.email_verified,
        "location": current_user.location,
        "bio": current_user.bio,
        "avatar_url": current_user.avatar_url,
        "company": getattr(current_user, 'company', None),
        "specialization": getattr(current_user, 'specialization', None),
        "verification_documents": doc_list,
        "created_at": current_user.created_at,
        "last_login": current_user.last_login
    }
    
    return user_data

@router.put("/me", response_model=UserResponse)
async def update_user_me(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update current user profile"""
    
    # Update allowed fields
    if user_data.name is not None:
        current_user.name = user_data.name
    if user_data.phone is not None:
        current_user.phone = user_data.phone
    if user_data.location is not None:
        current_user.location = user_data.location
    if user_data.bio is not None:
        current_user.bio = user_data.bio
    if user_data.company is not None:
        current_user.company = user_data.company
    if user_data.specialization is not None:
        current_user.specialization = user_data.specialization
    
    await db.commit()
    await db.refresh(current_user)
    
    return await read_users_me(current_user=current_user, db=db)
    
@router.post("/me/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload user avatar"""
    import shutil
    import os
    import uuid
    
    # Verify file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
        
    # Generate unique filename
    ext = file.filename.split('.')[-1]
    filename = f"{current_user.id}_{uuid.uuid4().hex}.{ext}"
    upload_path = f"static/uploads/avatars/{filename}"
    
    # Save file
    try:
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
         raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save file: {e}"
        )
            
    # Update user avatar URL
    # Assuming the frontend URL logic; saving relative path or full URL?
    # Let's save the relative path from root, served via /static
    current_user.avatar_url = f"/static/uploads/avatars/{filename}"
    
    await db.commit()
    await db.refresh(current_user)
    
    return UserResponse.from_orm(current_user)

@router.post("/me/password", response_model=MessageResponse)
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Change current user password"""
    
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )
    
    current_user.password_hash = get_password_hash(password_data.new_password)
    
    await db.commit()
    
    return {"message": "Password updated successfully"}

from app.schemas.property import PropertyResponse
from sqlalchemy.orm import selectinload
from typing import List

# Saved Properties
@router.get("/me/saved", response_model=List[PropertyResponse])
async def get_saved_properties(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get saved properties for current user"""
    from app.models.property import Property

    # Explicitly query properties to ensure agent is loaded
    stmt = select(Property).join(
        User.saved_properties
    ).where(
        User.id == current_user.id
    ).options(
        selectinload(Property.agent)
    )
    
    result = await db.execute(stmt)
    properties = result.scalars().all()
    
    return properties

@router.post("/me/saved/{property_id}", response_model=MessageResponse)
async def save_property(
    property_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Save a property to favorites"""
    from app.models.property import Property
    
    # Check if exists
    stmt = select(Property).where(Property.id == property_id)
    result = await db.execute(stmt)
    property_item = result.scalar_one_or_none()
    
    if not property_item:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Check if already saved
    if property_item in current_user.saved_properties:
        return {"message": "Property already saved"}
    
    current_user.saved_properties.append(property_item)
    await db.commit()
    
    return {"message": "Property saved successfully"}

@router.delete("/me/saved/{property_id}", response_model=MessageResponse)
async def unsave_property(
    property_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove a property from favorites"""
    from app.models.property import Property

    # Check if exists
    stmt = select(Property).where(Property.id == property_id)
    result = await db.execute(stmt)
    property_item = result.scalar_one_or_none()
    
    if not property_item:
        raise HTTPException(status_code=404, detail="Property not found")
        
    if property_item in current_user.saved_properties:
        current_user.saved_properties.remove(property_item)
        await db.commit()
    
    return {"message": "Property removed from favorites"}

@router.post("/me/viewed/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def track_user_view(
    property_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Track property view for user history"""
    from app.models.property import Property
    
    # Check if exists
    stmt = select(Property).where(Property.id == property_id)
    result = await db.execute(stmt)
    property_item = result.scalar_one_or_none()
    
    if property_item and property_item not in current_user.viewed_properties:
        current_user.viewed_properties.append(property_item)
        await db.commit()
    
    return None

@router.get("/me/stats")
async def get_user_stats(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user dashboard stats"""
    from app.models.inquiry import Inquiry
    from sqlalchemy import func

    # Get inquiries count (Scheduled Visits)
    inquiry_stmt = select(func.count()).select_from(Inquiry).where(Inquiry.user_id == current_user.id)
    inquiry_result = await db.execute(inquiry_stmt)
    inquiries_count = inquiry_result.scalar()

    return {
        "saved_properties": len(current_user.saved_properties),
        "properties_viewed": len(current_user.viewed_properties),
        "scheduled_visits": inquiries_count
    }

@router.get("/agents/public", response_model=List[UserResponse])
async def list_public_agents(db: AsyncSession = Depends(get_db)):
    """List verified agents publicly"""
    from app.models.property import Property
    stmt = select(User).where(
        User.role == UserRole.AGENT,
        User.status == UserStatus.ACTIVE,
        User.agent_status == AgentStatus.VERIFIED
    )
    result = await db.execute(stmt)
    agents = result.scalars().all()

    agent_list = []
    for a in agents:
        count_stmt = select(func.count()).select_from(Property).where(Property.agent_id == a.id)
        count_result = await db.execute(count_stmt)
        prop_count = count_result.scalar() or 0

        agent_list.append({
            "id": a.id,
            "email": a.email,
            "name": a.name,
            "phone": a.phone,
            "role": a.role,
            "status": a.status,
            "agent_status": a.agent_status,
            "email_verified": a.email_verified,
            "location": a.location,
            "bio": a.bio,
            "avatar_url": a.avatar_url,
            "company": a.company,
            "specialization": a.specialization,
            "verification_documents": [],
            "property_count": prop_count,
            "created_at": a.created_at,
            "last_login": a.last_login,
        })
    return agent_list

@router.get("/agents/public/{agent_id}", response_model=UserResponse)
async def get_public_agent_profile(agent_id: str, db: AsyncSession = Depends(get_db)):
    """Get a single agent's public profile"""
    from app.models.property import Property
    # Match by role=AGENT OR agent_status=VERIFIED to be flexible
    stmt = select(User).where(
        User.id == agent_id,
        User.status == UserStatus.ACTIVE
    )
    result = await db.execute(stmt)
    agent = result.scalar_one_or_none()
    if not agent or (agent.role != UserRole.AGENT and agent.agent_status != AgentStatus.VERIFIED):
        raise HTTPException(status_code=404, detail="Agent not found")

    count_stmt = select(func.count()).select_from(Property).where(Property.agent_id == agent.id)
    count_result = await db.execute(count_stmt)
    prop_count = count_result.scalar() or 0

    return {
        "id": agent.id,
        "email": agent.email,
        "name": agent.name,
        "phone": agent.phone,
        "role": agent.role,
        "status": agent.status,
        "agent_status": agent.agent_status,
        "email_verified": agent.email_verified,
        "location": agent.location,
        "bio": agent.bio,
        "avatar_url": agent.avatar_url,
        "company": agent.company,
        "specialization": agent.specialization,
        "verification_documents": [],
        "property_count": prop_count,
        "created_at": agent.created_at,
        "last_login": agent.last_login,
    }

@router.post("/me/apply-agent", response_model=MessageResponse)
async def apply_to_be_agent(
    national_id_number: str = Form(...),
    date_of_birth: str = Form(...),
    full_address: str = Form(...),
    motivation: str = Form(...),
    location: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Unified endpoint for agent application including document upload"""
    
    # Update profile fields
    current_user.agent_status = AgentStatus.PENDING
    if phone:
        current_user.phone = phone
    if location:
        current_user.location = location
    
    # In some models we might store motivation/address in bio or other fields, 
    # but here we'll just focus on getting the document and status right.
    # For now, let's append motivation to bio or just rely on the logging.
    if motivation:
        current_user.bio = (current_user.bio or "") + f"\n\n[Agent Application Motivation]:\n{motivation}"

    # Handle document upload if provided
    if file:
        # Re-use logic from upload_verification_document but integrated
        from app.utils.s3 import s3_client
        s3_client.ensure_bucket_exists()
        
        orig_filename = file.filename or "id_document.bin"
        ext = orig_filename.split('.')[-1] if '.' in orig_filename else 'bin'
        filename = f"{current_user.id}_app_{uuid.uuid4().hex}.{ext}"
        object_name = f"verification/{current_user.id}/{filename}"
        
        success = s3_client.upload_file(file.file, object_name, content_type=file.content_type)
        if success:
            from app.models.verification_document import VerificationDocument, DocumentStatus
            new_doc = VerificationDocument(
                user_id=current_user.id,
                name=f"Identity Document (Application - {national_id_number})",
                url=s3_client.get_file_url(object_name),
                category="Identity",
                status=DocumentStatus.PENDING
            )
            db.add(new_doc)
        else:
            print(f"Warning: Failed to upload application document for user {current_user.id}")

    await db.commit()
    
    return {"message": "Agent application submitted successfully. Please wait for admin verification."}

@router.post("/me/request-agent", response_model=MessageResponse)
async def request_agent_status(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Request to become an agent"""
    from app.models.user import AgentStatus
    
    if current_user.role in ["agent", "admin", "super_admin"]:
        return {"message": "You already have elevated permissions"}
    
    if current_user.agent_status == AgentStatus.PENDING:
        return {"message": "Your request is already pending verification"}
    
    current_user.agent_status = AgentStatus.PENDING
    await db.commit()
    
    return {"message": "Agent request submitted successfully. Please wait for admin verification."}
@router.post("/me/verification-documents", response_model=UserResponse)
async def upload_verification_document(
    name: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload a verification document (ID, License, etc.)"""
    
    # Create bucket if not exists (lazy check)
    from app.utils.s3 import s3_client
    s3_client.ensure_bucket_exists()
        
    # Generate unique filename/key
    orig_filename = file.filename or "document.bin"
    ext = orig_filename.split('.')[-1] if '.' in orig_filename else 'bin'
    filename = f"{current_user.id}_{uuid.uuid4().hex}.{ext}"
    object_name = f"verification/{current_user.id}/{filename}"
    
    # Upload to S3
    success = s3_client.upload_file(file.file, object_name, content_type=file.content_type)
    if not success:
         raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not save document to storage."
        )
            
    # Category extraction from label "[Category] Name"
    category = "Other"
    clean_name = name
    if name.startswith('[') and ']' in name:
        category = name.split(']')[0][1:]
        clean_name = name.split(']', 1)[1].strip()

    # Create new document record in the table
    new_doc = VerificationDocument(
        user_id=current_user.id,
        name=clean_name,
        url=s3_client.get_file_url(object_name),
        category=category,
        status=DocumentStatus.PENDING
    )
    
    db.add(new_doc)
    
    # Update user status to PENDING if not already verified
    if current_user.agent_status != AgentStatus.VERIFIED:
        current_user.agent_status = AgentStatus.PENDING
    
    await db.commit()
    
    # Return updated user info (using read_users_me logic internally)
    return await read_users_me(current_user=current_user, db=db)

@router.delete("/me/verification-documents/{document_id}", response_model=UserResponse)
async def delete_verification_document(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a verification document"""
    stmt = select(VerificationDocument).where(VerificationDocument.id == document_id)
    res = await db.execute(stmt)
    doc = res.scalar_one_or_none()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Check ownership
    if doc.user_id != current_user.id and current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this document")
    
    # Try to delete from S3
    try:
        from app.utils.s3 import s3_client
        # Extract object name from URL
        # URL format: http://host:port/bucket/verification/user_id/filename
        # or https://api.guri24.com:8002/bucket/verification/user_id/filename
        # We can reconstruct it if we know the user_id and filename
        url_parts = doc.url.split('/')
        if 'verification' in url_parts:
            v_idx = url_parts.index('verification')
            object_name = "/".join(url_parts[v_idx:])
            s3_client.delete_file(object_name)
    except Exception as e:
        print(f"S3 Delete Error (Non-critical): {e}")

    await db.delete(doc)
    await db.commit()
    
    return await read_users_me(current_user=current_user, db=db)
