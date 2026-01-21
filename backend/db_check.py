import asyncio
import json
from sqlalchemy import text
from app.database import engine

async def check_db():
    try:
        async with engine.connect() as conn:
            print("--- Database Schema Check ---")
            res = await conn.execute(text("SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'users' AND column_name IN ('agent_status', 'verification_documents')"))
            for row in res.mappings():
                print(f"Column: {row['column_name']}, Type: {row['data_type']}, UDT: {row['udt_name']}")
                
            print("\n--- User Data Check (petergatitu61@gmail.com) ---")
            res = await conn.execute(text("SELECT id, name, role, status, agent_status, verification_documents FROM users WHERE email = 'petergatitu61@gmail.com'"))
            user = res.mappings().one_or_none()
            if user:
                print(f"ID: {user['id']}")
                print(f"Name: {user['name']}")
                print(f"Agent Status: {user['agent_status']} (Type: {type(user['agent_status'])})")
                docs = user['verification_documents']
                print(f"Docs: {docs} (Type: {type(docs)})")
            else:
                print("User not found.")
                
            print("\n--- Pending Agents Count ---")
            res = await conn.execute(text("SELECT COUNT(*) FROM users WHERE agent_status = 'pending'"))
            count = res.scalar()
            print(f"Count with WHERE agent_status = 'pending': {count}")
            
            res = await conn.execute(text("SELECT agent_status, COUNT(*) FROM users GROUP BY agent_status"))
            for row in res.mappings():
                print(f"Status: {row['agent_status']}, Count: {row['count']}")

    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(check_db())
