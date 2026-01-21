from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload
from typing import List
from datetime import datetime, timezone
from app.database import get_db
from app.models.property import Property, PropertyPurpose
from app.models.booking import Booking, BookingStatus
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingResponse, BookingUpdate
from app.core.dependencies import get_current_active_user

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_data: BookingCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new booking after checking availability and property type"""
    
    # Normalize dates to naive UTC for Postgres TIMESTAMP WITHOUT TIME ZONE
    # Pydantic parses JSON dates as aware, but DB expects naive (implicit UTC)
    check_in_naive = booking_data.check_in.astimezone(timezone.utc).replace(tzinfo=None)
    check_out_naive = booking_data.check_out.astimezone(timezone.utc).replace(tzinfo=None)

    # 1. Fetch property
    stmt = select(Property).where(Property.id == booking_data.property_id)
    result = await db.execute(stmt)
    property = result.scalar_one_or_none()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    if property.purpose != PropertyPurpose.STAY:
        raise HTTPException(
            status_code=400, 
            detail="This property is not available for short-term stays"
        )
    
    # 2. Check date validity
    if check_in_naive >= check_out_naive:
        raise HTTPException(status_code=400, detail="Check-out must be after check-in")
        
    if check_in_naive < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Cannot book in the past")

    # 3. Check for overlapping bookings
    overlap_stmt = select(Booking).where(
        and_(
            Booking.property_id == booking_data.property_id,
            Booking.status == BookingStatus.CONFIRMED,
            or_(
                and_(Booking.check_in <= check_in_naive, Booking.check_out > check_in_naive),
                and_(Booking.check_in < check_out_naive, Booking.check_out >= check_out_naive),
                and_(Booking.check_in >= check_in_naive, Booking.check_out <= check_out_naive)
            )
        )
    )
    overlap_result = await db.execute(overlap_stmt)
    if overlap_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Property is already booked for these dates")

    # 4. Calculate total price
    # Basic logic: price stored in property is nightly price for STAYs
    nights = (check_out_naive - check_in_naive).days
    total_price = property.price * nights

    # 5. Create booking
    new_booking = Booking(
        id=None, # Let DB generate UUID or use default
        property_id=booking_data.property_id,
        check_in=check_in_naive,
        check_out=check_out_naive,
        guest_count=booking_data.guest_count,
        user_id=current_user.id,
        total_price=total_price,
        status=BookingStatus.CONFIRMED # Auto-confirming for now
    )
    
    # ... (previous code)
    
    db.add(new_booking)
    await db.commit()
    
    # Reload booking with relationships for the response
    stmt_booking = select(Booking).where(Booking.id == new_booking.id).options(
        selectinload(Booking.property).selectinload(Property.agent),
        selectinload(Booking.user)
    )
    result_booking = await db.execute(stmt_booking)
    new_booking = result_booking.scalar_one()
    
    # 6. Send Notifications
    try:
        from app.services.email_service import email_service
        
        # Prepare booking details
        details = {
            "property_title": new_booking.property.title,
            "guest_name": current_user.name,
            "check_in": check_in_naive.strftime("%Y-%m-%d"),
            "check_out": check_out_naive.strftime("%Y-%m-%d"),
            "guest_count": booking_data.guest_count,
            "total_price": f"KES {total_price:,.2f}"
        }
        
        # Send to Agent
        if new_booking.property.agent and new_booking.property.agent.email:
            await email_service.send_booking_notification(new_booking.property.agent.email, details)
            
        # Send to Guest (Confirmation)
        if current_user.email:
             await email_service.send_booking_confirmation(current_user.email, details)
             
    except Exception as e:
        # Don't fail the request if email fails, just log it
        print(f"Failed to send booking emails: {e}")
        pass

    return new_booking

@router.get("/me", response_model=List[BookingResponse])
async def list_my_bookings(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """List bookings MADE BY the current user"""
    # Eager load property and its agent for the response
    stmt = select(Booking).\
        options(selectinload(Booking.property).selectinload(Property.agent)).\
        where(Booking.user_id == current_user.id).\
        order_by(Booking.check_in.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking_details(
    booking_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get single booking details. Accessible by Guest or Property Owner (Agent)."""
    # Load booking with property (and agent) and user (guest)
    stmt = select(Booking).\
        options(
            selectinload(Booking.property).selectinload(Property.agent),
            selectinload(Booking.user)
        ).\
        where(Booking.id == booking_id)
        
    result = await db.execute(stmt)
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    # Check permissions
    # 1. Is the current user the guest?
    is_guest = booking.user_id == current_user.id
    
    # 2. Is the current user the agent/owner of the property?
    # Booking.property is loaded, check agent_id
    is_agent = booking.property.agent_id == current_user.id
    
    if not (is_guest or is_agent):
         raise HTTPException(status_code=403, detail="Not authorized to view this booking")
         
    return booking

@router.get("/agent/received", response_model=List[BookingResponse])
async def list_agent_received_bookings(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """List bookings RECEIVED for properties owned by the current agent"""
    # Find bookings where property.agent_id == current_user.id
    # We need to load property (with agent) AND user (guest) for the dashboard
    stmt = select(Booking).\
        join(Property).\
        options(
            selectinload(Booking.property).selectinload(Property.agent),
            selectinload(Booking.user)
        ).\
        where(Property.agent_id == current_user.id).\
        order_by(Booking.check_in.desc())
    
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/property/{property_id}/availability")
async def check_availability(
    property_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get list of booked dates for a property to show in calendar"""
    stmt = select(Booking).where(
        and_(
            Booking.property_id == property_id,
            Booking.status == BookingStatus.CONFIRMED,
            Booking.check_out >= datetime.now(timezone.utc).replace(tzinfo=None)
        )
    )
    result = await db.execute(stmt)
    bookings = result.scalars().all()
    
    # Return date ranges
    return [{"check_in": b.check_in, "check_out": b.check_out} for b in bookings]
