import asyncio
import sys
import os

# FORCE ABSOLUTE PATH to backend
BACKEND_DIR = r"C:\Users\learn\Desktop\guri\backend"
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from sqlalchemy import select
from app.database import async_session_factory
from app.models.user import User

async def check_logins():
    async with async_session_factory() as db:
        print("--- Checking User Logins ---")
        
        stmt = select(User).order_by(User.last_login.desc().nullslast())
        result = await db.execute(stmt)
        users = result.scalars().all()
        
        found_login = False
        for u in users:
            status = "✅" if u.last_login else "❌"
            print(f"[{status}] {u.email} - Last Login: {u.last_login}")
            if u.last_login:
                found_login = True
                
        if not found_login:
            print("\nWARNING: No users have a 'last_login' timestamp set.")
            print("The 'Recent Activity' widget will be empty until someone logs in.")

if __name__ == "__main__":
    asyncio.run(check_logins())
