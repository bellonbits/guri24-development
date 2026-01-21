import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.property import Property

async def verify():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Property))
        properties = result.scalars().all()
        
        print(f"Total Properties: {len(properties)}")
        for p in properties[:5]:
            print(f"Property: {p.title} | Location: {p.location} | Lat: {p.latitude} | Lng: {p.longitude}")

if __name__ == "__main__":
    asyncio.run(verify())
