from fastapi import APIRouter, Depends, HTTPException, status, Query, Body, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime
import uuid
import re

def _make_slug(title: str) -> str:
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return f"{slug}-{uuid.uuid4().hex[:8]}"
from app.database import get_db
from app.models.user import User, UserRole, AgentStatus
from app.models.property import Property
from app.models.property import PropertyStatus
from app.schemas.user import UserResponse, AdminUserUpdate, UserUpdate, AdminUserCreate
from app.schemas.property import PropertyCreate, PropertyUpdate, PropertyResponse
from app.core.dependencies import get_current_admin_user
from app.models.verification_document import VerificationDocument
from app.utils.activity import log_activity

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/ping")
async def ping_admin():
    """Verify that the admin API is active and running the latest version"""
    return {
        "status": "ok",
        "timestamp": datetime.utcnow(),
        "version": "1.0.1-fixed-routing"
    }

@router.post("/impersonate/{user_id}")
async def impersonate_user(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Allow admin to impersonate a user/agent to view their portal"""
    
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    target_user = result.scalar_one_or_none()
    
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create a temporary session token for impersonation
    # This will be handled by the frontend to switch context
    return {
        "impersonated_user": {
            "id": str(target_user.id),
            "name": target_user.name,
            "email": target_user.email,
            "role": target_user.role,
            "agent_status": target_user.agent_status
        },
        "admin_id": str(current_user.id),
        "admin_name": current_user.name,
        "message": "Impersonation mode activated. Admin can now view agent portal."
    }

@router.get("/dashboard/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get admin dashboard statistics"""
    from app.models.inquiry import Inquiry
    
    # Count agents by status
    agent_total_stmt = select(func.count()).select_from(User).where(User.role == UserRole.AGENT)
    agent_verified_stmt = select(func.count()).select_from(User).where(
        User.role == UserRole.AGENT,
        User.agent_status == AgentStatus.VERIFIED
    )
    agent_pending_stmt = select(func.count()).select_from(User).where(
        User.agent_status == AgentStatus.PENDING
    )
    
    # Count properties by status
    property_total_stmt = select(func.count()).select_from(Property)
    property_published_stmt = select(func.count()).select_from(Property).where(
        Property.status == PropertyStatus.PUBLISHED
    )
    property_draft_stmt = select(func.count()).select_from(Property).where(
        Property.status == PropertyStatus.DRAFT
    )
    
    # Count inquiries
    inquiry_total_stmt = select(func.count()).select_from(Inquiry)
    inquiry_new_stmt = select(func.count()).select_from(Inquiry).where(
        Inquiry.status == "new"
    )
    
    # Execute all counts
    agent_total = (await db.execute(agent_total_stmt)).scalar()
    agent_verified = (await db.execute(agent_verified_stmt)).scalar()
    agent_pending = (await db.execute(agent_pending_stmt)).scalar()
    
    property_total = (await db.execute(property_total_stmt)).scalar()
    property_published = (await db.execute(property_published_stmt)).scalar()
    property_draft = (await db.execute(property_draft_stmt)).scalar()
    
    inquiry_total = (await db.execute(inquiry_total_stmt)).scalar()
    inquiry_new = (await db.execute(inquiry_new_stmt)).scalar()
    
    return {
        "agents": {
            "total": agent_total,
            "verified": agent_verified,
            "pending": agent_pending
        },
        "properties": {
            "total": property_total,
            "published": property_published,
            "draft": property_draft,
            "pending": property_draft  # For backward compatibility with frontend
        },
        "inquiries": {
            "total": inquiry_total,
            "new": inquiry_new
        },
        "pending_approvals": agent_pending + property_draft
    }

@router.get("/users", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 50,
    role: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """List all users with filters (Admin only)"""
    
    query = select(User)
    
    if role:
        query = query.where(User.role == role)
        
    if search:
        query = query.where(User.email.ilike(f"%{search}%") | User.name.ilike(f"%{search}%"))
        
    query = query.offset(skip).limit(limit).order_by(User.created_at.desc())
    
    result = await db.execute(query)
    users = result.scalars().all()
    
    return [UserResponse.from_orm(u) for u in users]

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user_details(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get detailed user info"""
    
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Fetch documents from table
    doc_stmt = select(VerificationDocument).where(VerificationDocument.user_id == user_id).order_by(VerificationDocument.uploaded_at.desc())
    doc_res = await db.execute(doc_stmt)
    docs = doc_res.scalars().all()
    
    # Transformation to list of dicts for safety
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
        
    # Check if model has agent_status (handle stale model for response dict)
    agent_status = getattr(user, 'agent_status', 'pending')
    
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "phone": user.phone,
        "role": user.role,
        "status": user.status,
        "agent_status": agent_status,
        "email_verified": user.email_verified,
        "location": getattr(user, 'location', None),
        "bio": getattr(user, 'bio', None),
        "avatar_url": getattr(user, 'avatar_url', None),
        "company": getattr(user, 'company', None),
        "specialization": getattr(user, 'specialization', None),
        "verification_documents": doc_list,
        "created_at": user.created_at,
        "last_login": user.last_login
    }

@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: uuid.UUID,
    role: str,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user role"""
    
    if current_user.role != "super_admin" and role == "admin":
         raise HTTPException(status_code=403, detail="Only super admins can promote users to admin")
         
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Validate role
    try:
        new_role = UserRole(role)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid role")
        
    user.role = new_role
    await db.commit()
    
    return {"message": f"User role updated to {role}"}

@router.patch("/agents/{user_id}/status")
async def update_agent_status(
    user_id: uuid.UUID,
    status: str,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Update agent status (suspend/activate)"""
    from app.models.user import UserStatus
    
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Validate status
    try:
        new_status = UserStatus(status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    user.status = new_status
    await db.commit()
    
    return {"message": f"Agent status updated to {status}"}

@router.get("/agents/{user_id}/performance")
async def get_agent_performance(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get agent performance metrics"""
    from app.models.inquiry import Inquiry
    from app.models.booking import Booking
    
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    agent = result.scalar_one_or_none()
    
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Count properties
    property_count_stmt = select(func.count()).select_from(Property).where(
        Property.agent_id == user_id
    )
    property_count = (await db.execute(property_count_stmt)).scalar()
    
    # Count inquiries
    inquiry_count_stmt = select(func.count()).select_from(Inquiry).join(
        Property
    ).where(Property.agent_id == user_id)
    inquiry_count = (await db.execute(inquiry_count_stmt)).scalar()
    
    # Count bookings
    booking_count_stmt = select(func.count()).select_from(Booking).join(
        Property
    ).where(Property.agent_id == user_id)
    booking_count = (await db.execute(booking_count_stmt)).scalar()
    
    return {
        "agent_id": user_id,
        "agent_name": agent.name,
        "properties": property_count,
        "inquiries": inquiry_count,
        "bookings": booking_count,
        "member_since": agent.created_at
    }

@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user_admin(
    user_data: AdminUserCreate,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new user (Admin only)"""
    from app.core.security import get_password_hash
    
    # Check if user already exists
    stmt = select(User).where(User.email == user_data.email)
    result = await db.execute(stmt)
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user with provided password
    new_user = User(
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone,
        password_hash=get_password_hash(user_data.password),
        role=user_data.role,
        email_verified=True  # Admin-created users are pre-verified
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # TODO: Send welcome email
    print(f"New user created: {user_data.email}")
    
    return UserResponse.from_orm(new_user)

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user_admin(
    user_id: uuid.UUID,
    user_data: AdminUserUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user details (Admin only)"""
    from app.core.security import get_password_hash
    
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields if provided
    if user_data.name is not None:
        user.name = user_data.name
        
    if user_data.email is not None:
        # Check if email is already taken by another user
        stmt = select(User).where(User.email == user_data.email, User.id != user_id)
        result = await db.execute(stmt)
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = user_data.email
        
    if user_data.phone is not None:
        user.phone = user_data.phone
        
    if user_data.password is not None:
        user.password_hash = get_password_hash(user_data.password)
        
    if user_data.role is not None:
        user.role = user_data.role
        
    if user_data.location is not None:
        user.location = user_data.location
        
    if user_data.bio is not None:
        user.bio = user_data.bio
        
    if user_data.company is not None:
        user.company = user_data.company
        
    if user_data.specialization is not None:
        user.specialization = user_data.specialization
    
    await db.commit()
    await db.refresh(user)
    
    return UserResponse.from_orm(user)

@router.delete("/users/{user_id}")
async def delete_user_admin(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete user (Admin only)"""
    
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent deleting yourself
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    await db.delete(user)
    await db.commit()
    
    return {"message": "User deleted successfully"}

@router.get("/system/health")
async def get_system_health(
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get system health status for monitoring"""
    
    # Check Database
    try:
        await db.execute(select(1))
        db_status = "healthy"
        db_latency = "12ms" # Mock latency
    except Exception:
        db_status = "degraded"
        db_latency = "timeout"
        
    # Mock other services for now
    return {
        "status": "operational",
        "timestamp": datetime.utcnow(),
        "services": {
            "api": {"status": "healthy", "uptime": "99.9%"},
            "database": {"status": db_status, "latency": db_latency},
            "cache": {"status": "healthy", "latency": "2ms"},
            "email": {"status": "healthy", "queue": 0}
        },
        "resources": {
            "cpu": 45,
            "memory": 60,
            "disk": 28
        }
    }

# Standalone image upload — works before a property_id exists
@router.post("/upload-image")
async def upload_property_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin_user),
):
    """Upload a single property image to storage, returns the public URL"""
    from app.services.storage_service import storage_service
    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP or GIF images are allowed")
    url = await storage_service.upload_file(file, folder="properties")
    return {"url": url}

# Property Management Endpoints
@router.post("/properties", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
async def create_property_admin(
    property_data: PropertyCreate,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new property (Admin only)"""
    
    # Create property with auto-generated slug
    new_property = Property(
        **property_data.dict(),
        slug=_make_slug(property_data.title),
        agent_id=current_user.id
    )
    
    db.add(new_property)
    await db.commit()
    
    # Refresh with agent loaded for PropertyResponse
    result = await db.execute(select(Property).where(Property.id == new_property.id).options(selectinload(Property.agent)))
    new_property = result.scalar_one()
    
    return PropertyResponse.from_orm(new_property)

@router.put("/properties/{property_id}", response_model=PropertyResponse)
async def update_property_admin(
    property_id: str,
    property_data: PropertyUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Update property (Admin only)"""
    
    stmt = select(Property).where(Property.id == property_id).options(selectinload(Property.agent))
    result = await db.execute(stmt)
    property = result.scalar_one_or_none()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Update fields
    update_data = property_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(property, field, value)
    
    await db.commit()
    
    # Refresh with agent loaded for PropertyResponse
    result = await db.execute(select(Property).where(Property.id == property.id).options(selectinload(Property.agent)))
    property = result.scalar_one()
    
    return PropertyResponse.from_orm(property)

@router.patch("/properties/{property_id}/status")
async def update_property_status(
    property_id: str,
    status: str,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Update property status (approve/reject/activate/deactivate)"""
    from app.models.property import PropertyStatus
    
    stmt = select(Property).where(Property.id == property_id)
    result = await db.execute(stmt)
    property = result.scalar_one_or_none()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Validate status
    try:
        new_status = PropertyStatus(status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    property.status = new_status
    
    # Set published_at if publishing
    if status == "published" and not property.published_at:
        property.published_at = datetime.utcnow()
    
    await db.commit()
    
    return {"message": f"Property status updated to {status}"}

@router.delete("/properties/{property_id}")
async def delete_property_admin(
    property_id: str,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete property (Admin only)"""
    
    stmt = select(Property).where(Property.id == property_id)
    result = await db.execute(stmt)
    property = result.scalar_one_or_none()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    await db.delete(property)
    await db.commit()
    
    return {"message": "Property deleted successfully"}
@router.get("/agents/pending", response_model=List[UserResponse])
async def list_pending_agents(
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """List agents awaiting verification"""
    # 1. Fetch all pending users
    stmt = select(User).where(User.agent_status == AgentStatus.PENDING)
    result = await db.execute(stmt)
    users = result.scalars().all()
    
    response_list = []
    
    for u in users:
        # 2. Fetch documents for this specific user from the table
        doc_stmt = select(VerificationDocument).where(VerificationDocument.user_id == u.id).order_by(VerificationDocument.uploaded_at.desc())
        doc_res = await db.execute(doc_stmt)
        docs = doc_res.scalars().all()
        
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
            
        # 3. Build response dict matching UserResponse schema
        user_data = {
            "id": u.id,
            "email": u.email,
            "name": u.name,
            "phone": u.phone,
            "role": u.role,
            "status": u.status,
            "agent_status": u.agent_status,
            "email_verified": u.email_verified,
            "location": getattr(u, 'location', None),
            "bio": getattr(u, 'bio', None),
            "avatar_url": getattr(u, 'avatar_url', None),
            "company": getattr(u, 'company', None),
            "specialization": getattr(u, 'specialization', None),
            "verification_documents": doc_list,
            "created_at": u.created_at,
            "last_login": u.last_login
        }
        response_list.append(user_data)
        
    return response_list

@router.post("/agents/{user_id}/verify")
async def verify_agent(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Approve and verify an agent account"""
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.agent_status = AgentStatus.VERIFIED
    user.role = UserRole.AGENT # Ensure they have the agent role
    
    # Log Activity
    await log_activity(
        db=db,
        user_id=current_user.id,
        activity_type="agent_verified",
        description=f"Agent '{user.name}' ({user.email}) verified by {current_user.name}",
        metadata={"agent_id": str(user.id), "agent_name": user.name}
    )
    
    await db.commit()
    
    return {"message": "Agent verified successfully"}

@router.post("/agents/{user_id}/reject")
async def reject_agent(
    user_id: uuid.UUID,
    rejection_data: dict = Body(default={}),
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Reject an agent verification request"""
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.agent_status = AgentStatus.REJECTED
    user.role = UserRole.USER # Revert to regular user role
    
    # Store rejection reason if provided
    reason = rejection_data.get('reason', '')
    if reason:
        # Check if user model has rejection_reason field
        if hasattr(user, 'rejection_reason'):
            user.rejection_reason = reason
        else:
            # Use SQL to set it if model is stale
            from sqlalchemy import text
            await db.execute(
                text("UPDATE users SET rejection_reason = :reason WHERE id = :id"),
                {"reason": reason, "id": user_id}
            )
    
    # Log Activity
    await log_activity(
        db=db,
        user_id=current_user.id,
        activity_type="agent_rejected",
        description=f"Agent '{user.name}' rejection by {current_user.name}. Reason: {reason}",
        metadata={"agent_id": str(user.id), "agent_name": user.name, "reason": reason}
    )
    
    await db.commit()
    
    return {"message": "Agent verification rejected"}

# Inquiry Management Endpoints
@router.get("/inquiries")
async def list_inquiries(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """List all customer inquiries (Admin only)"""
    from app.models.inquiry import Inquiry
    
    query = select(Inquiry).options(
        selectinload(Inquiry.property),
        selectinload(Inquiry.user)
    )
    
    if status:
        query = query.where(Inquiry.status == status)
    
    query = query.offset(skip).limit(limit).order_by(Inquiry.created_at.desc())
    
    result = await db.execute(query)
    inquiries = result.scalars().all()
    
    return inquiries

@router.patch("/inquiries/{inquiry_id}/status")
async def update_inquiry_status(
    inquiry_id: str,
    status: str,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Update inquiry status"""
    from app.models.inquiry import Inquiry
    
    stmt = select(Inquiry).where(Inquiry.id == inquiry_id)
    result = await db.execute(stmt)
    inquiry = result.scalar_one_or_none()
    
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    
    inquiry.status = status
    await db.commit()
    
    return {"message": f"Inquiry status updated to {status}"}

@router.patch("/inquiries/{inquiry_id}/reassign")
async def reassign_inquiry(
    inquiry_id: str,
    new_agent_id: str,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Reassign inquiry to a different agent by changing the property's agent"""
    from app.models.inquiry import Inquiry
    
    stmt = select(Inquiry).where(Inquiry.id == inquiry_id).options(
        selectinload(Inquiry.property)
    )
    result = await db.execute(stmt)
    inquiry = result.scalar_one_or_none()
    
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    
    if not inquiry.property:
        raise HTTPException(status_code=400, detail="Inquiry has no associated property")
    
    # Verify new agent exists
    agent_stmt = select(User).where(User.id == new_agent_id)
    agent_result = await db.execute(agent_stmt)
    new_agent = agent_result.scalar_one_or_none()
    
    if not new_agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Update property's agent
    inquiry.property.agent_id = new_agent_id
    await db.commit()
    
    return {"message": "Inquiry reassigned successfully"}
