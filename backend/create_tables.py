import asyncio
import os
import sys
from app.database import engine, Base
# Ensure all models are imported
from app.models.user import User
from app.models.property import Property
from app.models.inquiry import Inquiry
from app.models.booking import Booking
from app.models.messaging import Conversation, Message
from app.models.verification_document import VerificationDocument
from app.models.activity import Activity

async def create_tables():
    print("--- Creating Database Tables ---")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Done.")

if __name__ == "__main__":
    import platform
    if platform.system() == "Windows":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(create_tables())
