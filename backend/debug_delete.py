import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.getcwd())

from app.database import AsyncSessionLocal
from sqlalchemy import select, text
from app.models.user import User
from sqlalchemy.orm import selectinload

async def debug_delete(user_id):
    async with AsyncSessionLocal() as db:
        print(f"Attempting to delete user: {user_id}")
        try:
            stmt = select(User).where(User.id == user_id)
            result = await db.execute(stmt)
            user = result.scalar_one_or_none()
            
            if not user:
                print("User not found in DB.")
                return
            
            print(f"User found: {user.email} ({user.role})")
            
            # Try to delete
            await db.delete(user)
            await db.commit()
            print("Successfully deleted user in DB script.")
            
        except Exception as e:
            print(f"FAILED TO DELETE USER: {type(e).__name__}")
            print(f"Error details: {str(e)}")
            # Rollback to be safe
            await db.rollback()

if __name__ == "__main__":
    # User ID from the error message
    target_id = "093aeda2-40bd-4822-8018-8e5ad514e53c"
    asyncio.run(debug_delete(target_id))
