import asyncio
import os
import sys
from sqlalchemy import select, func
from app.database import AsyncSessionLocal
from app.models.activity import Activity
from app.models.user import User

# Add backend directory to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

async def seed_activity():
    # Disable engine echo
    from app.database import engine
    engine.echo = False
    
    async with AsyncSessionLocal() as db:
        print("\n--- Seeding Initial Activity Data ---")
        
        # 1. Get a sample user ID (just the ID to avoid Enum loading issues)
        from sqlalchemy import text
        res = await db.execute(text("SELECT id FROM users LIMIT 1"))
        sample_row = res.first()
        user_id = sample_row[0] if sample_row else None
        user_name = "Sample User" if user_id else "System"

        activities = [
            {
                "type": "user_login",
                "description": f"User {user_name} logged into the system",
                "metadata": {"source": "web"}
            },
            {
                "type": "property_listed",
                "description": "New property 'Luxury Villa' was listed.",
                "metadata": {"property_id": "123"}
            },
            {
                "type": "agent_verified",
                "description": f"Agent {user_name} was verified by the system",
                "metadata": {"agent_id": str(user_id)}
            },
            {
                "type": "property_viewed",
                "description": "Property 'Naivasha Cottage' was viewed by a guest.",
                "metadata": {"property_id": "456"}
            }
        ]

        for act in activities:
            new_act = Activity(
                user_id=user_id,
                type=act["type"],
                description=act["description"],
                metadata_json=act["metadata"]
            )
            db.add(new_act)
        
        await db.commit()
        print(f"Successfully seeded {len(activities)} activities.")

if __name__ == "__main__":
    import platform
    if platform.system() == "Windows":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(seed_activity())
