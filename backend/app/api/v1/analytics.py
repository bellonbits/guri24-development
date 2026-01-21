from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from datetime import datetime, timedelta
from app.database import get_db
from app.models.property import Property, PropertyStatus
from app.models.user import User, UserRole, AgentStatus
from app.models.inquiry import Inquiry
from app.core.dependencies import get_current_admin_user
from typing import List, Dict, Any

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard")
async def get_dashboard_stats(
    period: str = Query("30d"),
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get summarized dashboard stats"""
    
    # Determine date range
    now = datetime.utcnow()
    if period == "7d":
        start_date = now - timedelta(days=7)
    elif period == "30d":
        start_date = now - timedelta(days=30)
    elif period == "90d":
        start_date = now - timedelta(days=90)
    else:
        start_date = now - timedelta(days=30)
        
    # Get total counts
    total_users_result = await db.execute(select(func.count(User.id)))
    total_users = total_users_result.scalar() or 0
    
    total_properties_result = await db.execute(select(func.count(Property.id)))
    total_properties = total_properties_result.scalar() or 0
    
    total_inquiries_result = await db.execute(select(func.count(Inquiry.id)))
    total_inquiries = total_inquiries_result.scalar() or 0
    
    # Get new counts in period
    new_users_result = await db.execute(select(func.count(User.id)).where(User.created_at >= start_date))
    new_users = new_users_result.scalar() or 0
    
    new_properties_result = await db.execute(select(func.count(Property.id)).where(Property.created_at >= start_date))
    new_properties = new_properties_result.scalar() or 0

    # --- Real-Time Data Fetching ---
    from app.models.booking import Booking, BookingStatus
    from app.models.activity import Activity
    from sqlalchemy.orm import selectinload
    
    # 1. Recent Bookings (Limit 5)
    bookings_stmt = (
        select(Booking)
        .options(selectinload(Booking.property), selectinload(Booking.user))
        .order_by(Booking.created_at.desc())
        .limit(5)
    )
    bookings_res = await db.execute(bookings_stmt)
    recent_bookings_raw = bookings_res.scalars().all()

    recent_bookings = []
    for b in recent_bookings_raw:
        recent_bookings.append({
            "id": str(b.id),
            "property_title": b.property.title if b.property else "Unknown Property",
            "guest_name": b.user.name if b.user else "Unknown Guest",
            "guest_email": b.user.email if b.user else "",
            "check_in": b.check_in.isoformat(),
            "check_out": b.check_out.isoformat(),
            "status": b.status.value if hasattr(b.status, 'value') else str(b.status),
            "total_price": float(b.total_price) if b.total_price else 0
        })

    # 2. Recent Activity (Querying the dedicated table)
    activities_stmt = (
        select(Activity)
        .order_by(Activity.timestamp.desc())
        .limit(15)
    )
    activities_res = await db.execute(activities_stmt)
    activities_list = activities_res.scalars().all()

    recent_activity = []
    for act in activities_list:
        recent_activity.append({
            "type": act.type,
            "description": act.description,
            "timestamp": act.timestamp.isoformat(),
            "user_id": str(act.user_id) if act.user_id else None
        })
    
    # --- Detailed Counts for Admin Grid ---
    # Agents
    agent_verified_count = (await db.execute(select(func.count(User.id)).where(User.role == UserRole.AGENT, User.agent_status == AgentStatus.VERIFIED))).scalar() or 0
    agent_pending_count = (await db.execute(select(func.count(User.id)).where(User.agent_status == AgentStatus.PENDING))).scalar() or 0
    
    # Properties
    prop_published_count = (await db.execute(select(func.count(Property.id)).where(Property.status == PropertyStatus.PUBLISHED))).scalar() or 0
    prop_pending_count = (await db.execute(select(func.count(Property.id)).where(Property.status == PropertyStatus.DRAFT))).scalar() or 0
    
    # Inquiries
    inquiry_new_count = (await db.execute(select(func.count(Inquiry.id)).where(Inquiry.status == "new"))).scalar() or 0

    return {
        "users": {
            "total": total_users,
            "new": new_users,
            "growth": round((new_users / max(1, (total_users - new_users))) * 100, 1)
        },
        "agents": {
            "total": (await db.execute(select(func.count(User.id)).where(User.role == UserRole.AGENT))).scalar() or 0,
            "verified": agent_verified_count,
            "pending": agent_pending_count
        },
        "properties": {
            "total": total_properties,
            "published": prop_published_count,
            "draft": prop_pending_count,
            "pending": prop_pending_count
        },
        "inquiries": {
            "total": total_inquiries,
            "new": inquiry_new_count
        },
        "pending_approvals": agent_pending_count + prop_pending_count,
        "revenue": {
            "total": 0,
            "growth": 0
        },
        "recent_bookings": recent_bookings,
        "recent_activity": recent_activity
    }

@router.get("/traffic")
async def get_traffic_data(
    period: str = Query("7d"),
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get traffic data for charts using real viewed_properties history"""
    try:
        from app.models.user import viewed_properties
        from sqlalchemy import cast, Date

        days = 30 if period == "30d" else 7
        start_date = datetime.utcnow() - timedelta(days=days)
        
        stmt = select(viewed_properties).where(viewed_properties.c.viewed_at >= start_date)
        result = await db.execute(stmt)
        rows = result.fetchall() 
        
        data_map = {}
        now = datetime.utcnow()
        for i in range(days):
            d = (now - timedelta(days=days-1-i)).strftime("%Y-%m-%d")
            data_map[d] = {"views": 0, "visitors": set()}

        for row in rows:
            # row access: viewed_at is column 2
            # Safe access: use integer index if mapping is uncertain, or attribute check
            v_at = row[2] # user_id, property_id, viewed_at
            
            if v_at:
                d_str = v_at.strftime("%Y-%m-%d")
                if d_str in data_map:
                    data_map[d_str]["views"] += 1
                    data_map[d_str]["visitors"].add(row[0]) # user_id is index 0

        labels = []
        views = []
        visitors = []
        
        for date_str in sorted(data_map.keys()):
            labels.append(date_str)
            views.append(data_map[date_str]["views"])
            visitors.append(len(data_map[date_str]["visitors"]))
            
        return {
            "labels": labels,
            "visitors": visitors,
            "views": views
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        # Return empty structure to prevent frontend crash
        return {"labels": [], "visitors": [], "views": []}

@router.get("/views-by-category")
async def get_property_views_by_category(
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Aggregate property views by type"""
    try:
        stmt = (
            select(Property.type, func.sum(Property.views))
            .group_by(Property.type)
            .order_by(func.sum(Property.views).desc())
        )
        
        result = await db.execute(stmt)
        rows = result.all()
        
        return [
            {
                "category": (row[0].value.title() if hasattr(row[0], 'value') else str(row[0]).title()) if row[0] else "Uncategorized", 
                "views": row[1] or 0
            }
            for row in rows
        ]
    except Exception as e:
        import traceback
        traceback.print_exc()
        return []

@router.get("/recent-activity")
async def get_recent_activity(
    limit: int = 15,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Refined: Combined recent events from the dedicated Activity table"""
    try:
        from app.models.activity import Activity
        
        stmt = select(Activity).order_by(Activity.timestamp.desc()).limit(limit)
        result = await db.execute(stmt)
        activities = result.scalars().all()
        
        return [
            {
                "id": str(item.id),
                "type": item.type,
                "action": item.description,
                "user": None, # Could join if needed, but description has details
                "property": None,
                "time": item.timestamp.isoformat()
            }
            for item in activities
        ]
    except Exception as e:
        import traceback
        traceback.print_exc()
        return []

@router.get("/top-properties")
async def get_top_properties(
    limit: int = 5,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get most viewed properties"""
    
    stmt = select(Property).order_by(desc(Property.views)).limit(limit)
    result = await db.execute(stmt)
    properties = result.scalars().all()
    
    return [
        {
            "id": str(p.id),
            "title": p.title,
            "location": p.location,
            "views": p.views,
            "inquiries": 0 # Join with inquiries count later
        }
        for p in properties
    ]
