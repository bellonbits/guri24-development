import asyncio
import logging
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.user import User, UserRole, UserStatus
from app.models.property import Property
from app.core.security import get_password_hash

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def create_admin():
    print("Creating admin user...")
    async with AsyncSessionLocal() as session:
        try:
            # Check if admin already exists
            email = "admin@guri24.com"
            result = await session.execute(select(User).where(User.email == email))
            existing_admin = result.scalar_one_or_none()

            if existing_admin:
                print(f"Admin user {email} already exists. Resetting password...")
                existing_admin.password_hash = get_password_hash("admin123")
                await session.commit()
                print("Password reset to: admin123")
                return

            # Create new admin
            admin_user = User(
                email=email,
                password_hash=get_password_hash("admin123"),
                name="System Admin",
                phone="+254700000000",
                role=UserRole.ADMIN,
                status=UserStatus.ACTIVE,
                email_verified=True
            )

            session.add(admin_user)
            await session.commit()
            await session.refresh(admin_user)
            
            print(f"Successfully created admin user!")
            print(f"Email: {email}")
            print(f"Password: admin123")
            
        except Exception as e:
            logger.error(f"Error creating admin: {e}")
            await session.rollback()

if __name__ == "__main__":
    asyncio.run(create_admin())
