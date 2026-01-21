import asyncio
import os
import sys
from sqlalchemy import select, func, desc
from app.database import AsyncSessionLocal
from app.models.user import User, saved_properties, viewed_properties
from app.models.property import Property
from app.models.inquiry import Inquiry
from app.models.booking import Booking

# Add backend directory to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

async def debug_activity():
    # Disable echo locally
    from app.database import engine
    engine.echo = False
    
    async with AsyncSessionLocal() as db:
        print("\n=== DATABASE CONTENT REPORT ===")

        # 1. Users
        users_res = await db.execute(select(func.count(User.id)))
        print(f"Total Users: {users_res.scalar()}")
        
        # 2. Properties
        props_res = await db.execute(select(func.count(Property.id)))
        print(f"Total Properties: {props_res.scalar()}")

        # 3. Last Logins
        login_stmt = select(User.name, User.last_login).where(User.last_login.isnot(None)).order_by(User.last_login.desc()).limit(5)
        login_res = await db.execute(login_stmt)
        logins = login_res.all()
        print(f"\nRecent Logins ({len(logins)}):")
        for l in logins:
            print(f" - {l.name}: {l.last_login}")

        # 4. Likes (Saved Properties)
        stmt_likes = (
            select(saved_properties, User.name, Property.title)
            .join(User, saved_properties.c.user_id == User.id)
            .join(Property, saved_properties.c.property_id == Property.id)
            .order_by(saved_properties.c.saved_at.desc())
            .limit(5)
        )
        likes_res = await db.execute(stmt_likes)
        likes = likes_res.all()
        print(f"\nRecent Likes ({len(likes)}):")
        for l in likes:
            print(f" - {l.name} liked {l.title} at {l.saved_at}")

        # 5. Views
        stmt_views = (
            select(viewed_properties, User.name, Property.title)
            .join(User, viewed_properties.c.user_id == User.id)
            .join(Property, viewed_properties.c.property_id == Property.id)
            .order_by(viewed_properties.c.viewed_at.desc())
            .limit(5)
        )
        views_res = await db.execute(stmt_views)
        views = views_res.all()
        print(f"\nRecent Views ({len(views)}):")
        for v in views:
            print(f" - {v.name} viewed {v.title} at {v.viewed_at}")

if __name__ == "__main__":
    import platform
    if platform.system() == "Windows":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(debug_activity())
