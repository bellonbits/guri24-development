import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.getcwd())

from app.database import AsyncSessionLocal
from sqlalchemy import select, func
from app.models.user import User, UserRole, AgentStatus
from app.models.property import Property, PropertyStatus
from app.models.inquiry import Inquiry

async def check():
    async with AsyncSessionLocal() as db:
        # User counts
        total_users = (await db.execute(select(func.count(User.id)))).scalar()
        agents = (await db.execute(select(func.count(User.id)).where(User.role == UserRole.AGENT))).scalar()
        verified_agents = (await db.execute(select(func.count(User.id)).where(User.role == UserRole.AGENT, User.agent_status == AgentStatus.VERIFIED))).scalar()
        pending_agents = (await db.execute(select(func.count(User.id)).where(User.agent_status == AgentStatus.PENDING))).scalar()
        
        # Property counts
        total_props = (await db.execute(select(func.count(Property.id)))).scalar()
        published_props = (await db.execute(select(func.count(Property.id)).where(Property.status == PropertyStatus.PUBLISHED))).scalar()
        pending_props = (await db.execute(select(func.count(Property.id)).where(Property.status == PropertyStatus.DRAFT))).scalar()
        
        # Inquiry counts
        total_inq = (await db.execute(select(func.count(Inquiry.id)))).scalar()
        new_inq = (await db.execute(select(func.count(Inquiry.id)).where(Inquiry.status == "new"))).scalar()
        
        print(f"Total Users: {total_users}")
        print(f"Total Agents: {agents} ({verified_agents} verified, {pending_agents} pending)")
        print(f"Total Properties: {total_props} ({published_props} published, {pending_props} pending)")
        print(f"Total Inquiries: {total_inq} ({new_inq} new)")

if __name__ == "__main__":
    asyncio.run(check())
