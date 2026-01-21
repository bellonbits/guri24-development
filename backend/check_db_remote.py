import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import json

async def check():
    url = "postgresql+asyncpg://admin:12345678@35.192.97.98:5432/guri24"
    engine = create_async_engine(url)
    try:
        async with engine.connect() as conn:
            print("Connected to remote DB: 35.192.97.98")
            
            # Check for the specific user
            email = 'petergatitu61@gmail.com'
            res = await conn.execute(text("SELECT id, name, email, role, agent_status, verification_documents FROM users WHERE email = :email"), {"email": email})
            user = res.mappings().one_or_none()
            
            if user:
                print(f"\n--- User: {email} ---")
                print(f"ID: {user['id']}")
                print(f"Name: {user['name']}")
                print(f"Agent Status: {user['agent_status']}")
                print(f"Docs: {user['verification_documents']}")
            else:
                print(f"\nUser {email} not found.")

            # Check general stats
            print("\n--- Agent Status Stats ---")
            res = await conn.execute(text("SELECT agent_status, COUNT(*) FROM users GROUP BY agent_status"))
            for row in res.mappings():
                print(f"Status: {row['agent_status']}, Count: {row['count']}")

            # Check for ANY records in verification_documents
            print("\n--- Users with docs ---")
            res = await conn.execute(text("SELECT email, agent_status FROM users WHERE verification_documents IS NOT NULL AND verification_documents != '[]'::jsonb"))
            for row in res.mappings():
                print(f"Email: {row['email']}, Status: {row['agent_status']}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check())
