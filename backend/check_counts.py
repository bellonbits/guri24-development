import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.getcwd())

from app.database import AsyncSessionLocal
from sqlalchemy import select, func
from app.models.user import User, UserRole
from app.models.property import Property
from app.models.inquiry import Inquiry

async def count():
    async with AsyncSessionLocal() as db:
        agent_count = (await db.execute(select(func.count()).select_from(User).where(User.role == UserRole.AGENT))).scalar()
        property_count = (await db.execute(select(func.count()).select_from(Property))).scalar()
        inquiry_count = (await db.execute(select(func.count()).select_from(Inquiry))).scalar()
        print(f"Agents: {agent_count}")
        print(f"Properties: {property_count}")
        print(f"Inquiries: {inquiry_count}")

if __name__ == "__main__":
    asyncio.run(count())
