import asyncio
from sqlalchemy import select, update
from app.database import engine, async_session
from app.models.user import User, UserRole

async def verify_all_admins():
    print("Surgical Admin Verification Starting...")
    async with async_session() as session:
        async with session.begin():
            # Find all admins
            stmt = select(User).where(User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN]))
            result = await session.execute(stmt)
            admins = result.scalars().all()
            
            if not admins:
                print("No admins found in database.")
                return

            print(f"Found {len(admins)} admin(s). Verifying...")
            
            # Update them
            for admin in admins:
                admin.email_verified = True
                print(f"✅ Verified: {admin.email}")
            
            await session.commit()
            print("Successfully updated all admin accounts.")

if __name__ == "__main__":
    asyncio.run(verify_all_admins())
