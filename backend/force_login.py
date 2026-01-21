import asyncio
import sys
import os
from datetime import datetime

# FORCE ABSOLUTE PATH to backend
BACKEND_DIR = r"C:\Users\learn\Desktop\guri\backend"
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from sqlalchemy import select, update
from app.database import async_session_factory
from app.models.user import User

async def force_login_update():
    async with async_session_factory() as db:
        print("--- Forcing Last Login Update ---")
        
        # Get the first admin user (since we know the user is 'System Admin')
        stmt = select(User).where(User.role.in_(['admin', 'super_admin'])).limit(1)
        result = await db.execute(stmt)
        admin = result.scalar_one_or_none()
        
        if admin:
            print(f"Updating last_login for {admin.email} (Role: {admin.role})")
            admin.last_login = datetime.utcnow()
            await db.commit()
            print("✅ Updated successfully.")
        else:
            print("❌ No admin found.")

if __name__ == "__main__":
    asyncio.run(force_login_update())
