import asyncio
import logging
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.user import User, UserRole, UserStatus
from app.core.security import get_password_hash

async def create_super_admin():
    print("Creating owner super_admin user...")
    async with AsyncSessionLocal() as session:
        try:
            email = "owner@guri24.com"
            result = await session.execute(select(User).where(User.email == email))
            existing_admin = result.scalar_one_or_none()

            if existing_admin:
                print(f"User {email} already exists. Upgrading to SUPER_ADMIN and resetting password...")
                existing_admin.password_hash = get_password_hash("owner123")
                existing_admin.role = UserRole.SUPER_ADMIN
                await session.commit()
                print("Password reset to: owner123")
                return

            admin_user = User(
                email=email,
                password_hash=get_password_hash("owner123"),
                name="Platform Owner",
                phone="+254700000000",
                role=UserRole.SUPER_ADMIN,
                status=UserStatus.ACTIVE,
                email_verified=True
            )

            session.add(admin_user)
            await session.commit()
            
            print(f"Successfully created super admin owner!")
            print(f"Email: {email}")
            print(f"Password: owner123")
            
        except Exception as e:
            print(f"Error creating admin: {e}")
            await session.rollback()

if __name__ == "__main__":
    asyncio.run(create_super_admin())
