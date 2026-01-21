import asyncio
import logging
from sqlalchemy import delete
from app.database import AsyncSessionLocal
from app.models.user import User, saved_properties, viewed_properties
from app.models.property import Property
from app.models.booking import Booking
from app.models.inquiry import Inquiry

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def reset_db():
    print("Starting database RESET...")
    async with AsyncSessionLocal() as db:
        try:
            # 1. Delete association tables (User <-> Property relationships)
            logger.info("Deleting saved_properties and viewed_properties...")
            await db.execute(saved_properties.delete())
            await db.execute(viewed_properties.delete())
            
            # 2. Delete Bookings
            logger.info("Deleting bookings...")
            await db.execute(delete(Booking))
            
            # 3. Delete Inquiries
            logger.info("Deleting inquiries...")
            await db.execute(delete(Inquiry))
            
            # 4. Delete Properties
            logger.info("Deleting properties...")
            await db.execute(delete(Property))
            
            # 5. Delete Users
            logger.info("Deleting users...")
            await db.execute(delete(User))
            
            await db.commit()
            logger.info("Successfully DELETED EVERYTHING from the database.")
            print("Database has been reset.")
            
        except Exception as e:
            logger.error(f"Error resetting DB: {e}")
            await db.rollback()
        finally:
            await db.close()

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(reset_db())
