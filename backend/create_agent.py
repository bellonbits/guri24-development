import asyncio
from sqlalchemy import select
from app.database import async_session
from app.models.user import User, UserRole
from app.core.security import get_password_hash

async def create_agent():
    async with async_session() as session:
        # Check if agent already exists
        email = "agent@guri24.com"
        stmt = select(User).where(User.email == email)
        result = await session.execute(stmt)
        existing_agent = result.scalar_one_or_none()
        
        if existing_agent:
            print(f"Agent user {email} already exists.")
            # Force reset password
            existing_agent.password_hash = get_password_hash("agent123")
            existing_agent.email_verified = True
            existing_agent.role = UserRole.AGENT
            await session.commit()
            print(f"Agent password reset to 'agent123'")
            return
        
        # Create new agent
        new_agent = User(
            email=email,
            password_hash=get_password_hash("agent123"),
            name="Test Agent",
            phone="+254712345678",
            role=UserRole.AGENT,
            email_verified=True
        )
        
        session.add(new_agent)
        await session.commit()
        print(f"Agent created successfully: {email} / agent123")

if __name__ == "__main__":
    asyncio.run(create_agent())
